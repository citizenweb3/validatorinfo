# Задача: блок-лист индексера возвращает неверный порядок (height сортируется как строка)

**Репозиторий:** `citizenweb3/chain-data-indexer`
**Ветка:** `monero-indexer` (HEAD `21a6678f`)
**Тип:** баг продакшена. Блокирует потребителя (ValidatorInfo).

---

## Симптом (живой прод)

`GET https://indexer.monero.citizenweb3.com/api/v1/blocks`:

```
?order=desc&limit=3  →  [999999, 999998, 999997]      # ожидался tip ~3 699 5xx
?order=asc&limit=3   →  [0, 1, 10]                     # ожидался [0, 1, 2]
```

`[0, 1, 10]` и `[999999, …]` — однозначная подпись **строковой** сортировки
(`"10" < "2"`, `"999999" > "3699529"` т.к. `'9' > '3'`). Реальный tip
(`3699529`, достаётся по id `/api/v1/blocks/3699529`) через список **недостижим**.

## Влияние

ValidatorInfo читает tip и «последние» через list-пагинацию (`order=desc`):
network hashrate (tip-блок), `/api/v1/supply` (последний чекпойнт), агрегаты
пулов. Со строковым порядком всё это берёт мусорный «tip» = 999999. Пока баг
жив — VI держит Monero-джобы за флагом OFF.

## Диагноз

Код в ветке **корректен**: `src/api.ts` сортирует по голой колонке
`height` / `tx.block_height` (`ORDER BY height ${direction}` — стр. 313, 373, 523;
`ORDER BY tx.block_height …` — стр. 466), а `initdb/001-schema.sql` объявляет
`height BIGINT NOT NULL`. По `bigint` Postgres сортирует числом — всегда.

Раз прод сортирует строкой при корректном коде — **расходится живое состояние**.
Причём в индексере **нет механизма смены типа колонки**: схема накатывается
`CREATE TABLE IF NOT EXISTS` + `ALTER … ADD COLUMN IF NOT EXISTS` (так приехал
`coinbase_extra_hex`, `005-coinbase-extra.sql`). Поменять ТИП существующей
колонки нечем — `CREATE IF NOT EXISTS` живую таблицу не трогает.

Две возможные причины (различить — одной командой):

1. **Живая колонка `height` фактически `TEXT`** (БД создана раньше/иначе, тип
   так и не сконвертили).
2. **В задеплоенном бинаре свой незакоммиченный `ORDER BY … ::text`** (в ветке
   такого нет; деплой мог собраться с грязного дерева).

---

## ШАГ 1 — проверить (определяет причину)

На боевой БД:

```sql
\d monero_blocks
\d monero_transactions
\d monero_supply_checkpoints   -- или как называется supply-таблица
```

Смотрим тип колонок `height` (и `block_height` в transactions).

- `height | text` → **Причина 1** → ШАГ 2A.
- `height | bigint` → **Причина 2** → ШАГ 2B.

---

## ШАГ 2A — если колонка TEXT: конвертить тип

```sql
ALTER TABLE monero_blocks
  ALTER COLUMN height TYPE BIGINT USING height::bigint;

ALTER TABLE monero_transactions
  ALTER COLUMN block_height TYPE BIGINT USING block_height::bigint;

-- если в supply-таблице height тоже text:
ALTER TABLE monero_supply_checkpoints
  ALTER COLUMN height TYPE BIGINT USING height::bigint;
```

После `ALTER` существующие индексы (`monero_blocks_height_idx ON (height DESC)`
и т.д.) снова работают, **код менять не надо**.

⚠️ Чтобы свежие деплои больше не словили это — добавить idempotent-миграцию
файлом `initdb/006-height-bigint.sql` с теми же `ALTER … TYPE BIGINT` (они
безопасно no-op, если колонка уже bigint), и закоммитить в `monero-indexer`.

## ШАГ 2B — если колонка BIGINT: баг в задеплоенном коде

Значит running-бинарь ≠ ветка. Найти в деплое реальный `ORDER BY` для
`/api/v1/blocks` / `/transactions` / `/supply` — почти наверняка там
`ORDER BY height::text` или сортировка по text-выражению. Привести к
`ORDER BY height` (bigint), закоммитить в `monero-indexer`, пересобрать/передеплоить.

---

## ШАГ 3 — проверка (после фикса)

```
curl -s -H "Authorization: Bearer <token>" \
  "https://indexer.monero.citizenweb3.com/api/v1/blocks?order=desc&limit=3"
# ожидаем первые heights = реальный tip (~3 699 5xx), убывают по числу

curl ... "?order=asc&limit=3"
# ожидаем [0, 1, 2]
```

Готово, когда `desc` начинается с настоящего tip, а `asc` даёт `[0,1,2]`.

---

## Заметки
- coinbase_extra_hex и синк — ОК (`/health` lag ~6). Это единственный остаток.
- Менять формат/пути API НЕ нужно — фикс только про порядок (тип колонки или
  одно `ORDER BY`).
