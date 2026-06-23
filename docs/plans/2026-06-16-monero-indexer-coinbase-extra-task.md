# Задача: добавить `coinbase_extra_hex` в Monero Indexer API

**Репозиторий:** `citizenweb3/chain-data-indexer`
**Ветка:** `monero-indexer`
**Тип:** аддитивное, обратносовместимое изменение API (новое поле в block-DTO).

**Зачем:** ValidatorInfo идентифицирует майнинг-пулы по «хвосту» (`tx_extra`)
coinbase-транзакции каждого блока. Сейчас API отдаёт только `extra_size` (число) —
этого недостаточно. Сырой `extra` уже лежит в БД, но наружу не выставлен.
Нужно выставить его как hex-строку.

---

## Контекст: данные уже есть, переиндексация НЕ нужна

Indexer кладёт полный распарсенный блок в `monero_blocks.raw` (JSONB).
Coinbase-`extra` доступен по пути:

```
monero_blocks.raw -> 'parsed_json' -> 'miner_tx' -> 'extra'
```

Это **массив байт-чисел** `[1, 234, 17, ...]` (значения 0–255). Типы уже описаны
в `src/types.d.ts`:
- `IndexedMoneroBlock.parsedBlock: MoneroBlockJson`
- `MoneroBlockJson.miner_tx: MoneroTxJson`
- `MoneroTxJson.extra?: unknown[]`

⚠️ **Важно:** coinbase (miner_tx) — это **НЕ** строка в таблице `monero_transactions`
(там только обычные транзакции). Источник — **только**
`monero_blocks.raw.parsed_json.miner_tx.extra`. Не искать в tx-таблице.

---

## Что отдавать

Новое поле в block-DTO:

- **Имя:** `coinbase_extra_hex` (snake_case, в ряд с `difficulty_hex`, `miner_tx_hash`).
- **Тип:** `string | null`.
- **Значение:** весь массив `miner_tx.extra` → lowercase-hex, каждый байт в
  2 символа без разделителей. Пример: `[1, 171, 0]` → `"01ab00"`.
- **`null`**, если `miner_tx.extra` отсутствует / пустой / не массив.
- **Сырой, без разбора TLV.** Не вырезать pubkey / nonce / merge-mining теги —
  ValidatorInfo сам парсит TLV и берёт остаток. Indexer отдаёт полный extra как есть.

Кодировщик (валидировать байты 0–255, иначе → `null`):

```ts
// src/txDecode.ts (или src/utils)
export function extraToHex(extra: unknown): string | null {
  if (!Array.isArray(extra) || extra.length === 0) return null;
  let out = '';
  for (const b of extra) {
    if (typeof b !== 'number' || !Number.isInteger(b) || b < 0 || b > 255) return null;
    out += b.toString(16).padStart(2, '0');
  }
  return out;
}
```

---

## Изменения по файлам

### 1. Схема — персистентная колонка

`initdb/` (новый файл миграции, напр. `004-coinbase-extra.sql`):

```sql
ALTER TABLE monero_blocks ADD COLUMN IF NOT EXISTS coinbase_extra_hex TEXT;
```

Колонку выбрали (а не JSONB-экстракт в SELECT), потому что `blockSummary()`
прокидывает колонки строки напрямую, а list-эндпоинт (`handleBlocks`) `raw`
**не** селектит — тянуть полный `raw` на каждую строку страницы (до 1000) дорого.
Колонка дешевле и попадает в существующий паттерн.

### 2. Sink — писать колонку при инжесте

`src/sink/postgres.ts`, функция вставки блоков (рядом с `blockRaw`,
в `INSERT INTO monero_blocks (...)`):
- посчитать `extraToHex(entry.parsedBlock.miner_tx?.extra)`;
- добавить в список колонок `coinbase_extra_hex` и в массив значений (рядом с `raws`).

### 3. Backfill существующих блоков (~3.68М)

Одноразовый скрипт (напр. `src/runner/backfillCoinbaseExtra.ts`), батчами (5–10k),
переиспользуя `extraToHex`:

```sql
-- читать пачку
SELECT hash, raw->'parsed_json'->'miner_tx'->'extra' AS extra
FROM monero_blocks
WHERE coinbase_extra_hex IS NULL
ORDER BY height
LIMIT 5000;
-- на каждый: UPDATE monero_blocks SET coinbase_extra_hex = $1 WHERE hash = $2;
```

(JSONB→hex чисто в SQL делать не надо — проще в Node через `extraToHex`,
тот же кодировщик, что и в sink.)

### 4. API DTO

`src/api.ts`:
- в тип `BlockApiRow` добавить `coinbase_extra_hex: string | null`;
- в **обоих** SELECT — `handleBlocks` (список) и `handleBlockById` (деталь) —
  добавить колонку `coinbase_extra_hex` в список полей;
- в `blockSummary(row)` добавить строку `coinbase_extra_hex: row.coinbase_extra_hex`
  (как прокидывается `difficulty_hex`).

Так поле появится **и в списке** (`/api/v1/blocks`), **и в детали**
(`/api/v1/blocks/{id}`) — VI'шным джобам нужен именно список (они идут страницами
по `listBlocks` и гоняют `identifyPool` на каждом блоке).

### 5. OpenAPI + доки

- `src/openapi.ts` — добавить `coinbase_extra_hex` (`type: string, nullable: true`)
  в схему блока, с описанием «Hex of coinbase (miner_tx) tx_extra; null if empty».
- `docs/indexer-api.md`, `docs/api.md` — упомянуть поле.

---

## Edge-cases

- Блоки без extra / genesis / битый extra → `coinbase_extra_hex = null`.
  Потребитель (VI) это уже корректно обрабатывает (пустой fingerprint).
- Реорг / несеттленные блоки: колонка пишется так же, как `raw` — отдельной
  логики не нужно.
- Не менять формат остальных полей — изменение аддитивное, обратносовместимое.

---

## Критерий приёмки (проверка)

1. `coinbase_extra_hex` присутствует в ответах `/api/v1/blocks` и `/api/v1/blocks/{id}`.
2. Для settled-блока значение непустое и валидный hex (чётная длина, `^[0-9a-f]+$`).
3. Backfill: `SELECT count(*) FROM monero_blocks WHERE coinbase_extra_hex IS NULL`
   стремится к нулю (кроме реально пустых extra).
4. Sanity: на свежих блоках известных пулов (SupportXMR / MoneroOcean) hex содержит
   ASCII-метку — `echo <hex> | xxd -r -p` показывает `supportxmr.com` / `MoneroOcean`
   в хвосте. Это и есть то, что VI ловит детектором.

---

## Чего НЕ делать

- Не парсить / не резать TLV на стороне индексера — отдавать сырой полный extra.
- Не трогать существующие поля и пути (`/api/v1/*`, `{data:[...]}`-конверт,
  snake_case) — VI-клиент подгоняется под текущий контракт + это новое поле.
- Не лезть в `monero_transactions` за coinbase — его там нет.
