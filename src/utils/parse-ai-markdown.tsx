import { ReactNode } from 'react';
import Link from 'next/link';

const INTERNAL_PREFIXES = ['/networks', '/validators', '/stakingcalculator', '/comparevalidators', '/web3stats', '/ecosystems'];

const extractPath = (href: string): string => {
  try {
    const url = new URL(href);
    return url.pathname + url.search + url.hash;
  } catch {
    return href;
  }
};

const isInternalPath = (pathname: string): boolean =>
  pathname === '/' || INTERNAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const SITE_HOSTNAMES = ['validatorinfo.com', 'www.validatorinfo.com', 'dev.validatorinfo.com', 'localhost'];

const getInternalPath = (href: string): string | null => {
  if (href.startsWith('/')) return isInternalPath(href) ? href : null;
  try {
    const url = new URL(href);
    const hostname = url.hostname.replace(/^www\./, '');
    if (!SITE_HOSTNAMES.some((h) => hostname === h)) return null;
    const path = url.pathname + url.search + url.hash;
    return isInternalPath(url.pathname) ? path : null;
  } catch {
    return null;
  }
};

const isSameSiteUrl = (href: string): boolean => getInternalPath(href) !== null;

const renderLink = (text: string, href: string, key: number): ReactNode => {
  const cleanHref = href.replace(/^<|>$/g, '');
  if (/^(javascript|data|vbscript):/i.test(cleanHref)) {
    return <span key={key}>{text}</span>;
  }
  const internalPath = getInternalPath(cleanHref);
  if (internalPath) {
    return (
      <Link key={key} href={internalPath} data-chat-link className="text-highlight underline hover:text-white">
        {text}
      </Link>
    );
  }
  return (
    <a key={key} href={cleanHref} target="_blank" rel="noopener noreferrer" data-chat-link className="text-highlight underline hover:text-white">
      {text}
    </a>
  );
};

// Matches: markdown links [text](url) including relative paths and angle-bracket URLs,
// bold **text**, or bare URLs https://...
const parseInline = (text: string, keyOffset: number = 0): ReactNode[] => {
  const regex = /\[([^\]]+)\]\((<[^>]+>|[^)]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s),]+)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = keyOffset;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      parts.push(renderLink(match[1], match[2], key++));
    } else if (match[3] !== undefined) {
      parts.push(<strong key={key++}>{parseInline(match[3], key * 1000)}</strong>);
    } else if (match[4] !== undefined) {
      const href = match[4];
      const displayText = isSameSiteUrl(href) ? extractPath(href) : href;
      parts.push(renderLink(displayText, href, key++));
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const isTableSeparator = (line: string): boolean =>
  /^\|[\s:|-]+\|$/.test(line.trim());

const parseTableRow = (line: string, key: number, isHeader: boolean): ReactNode => {
  const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const Tag = isHeader ? 'th' : 'td';
  const cellClass = isHeader
    ? 'px-2 py-1 text-left font-bold text-white border-b border-bgSt'
    : 'px-2 py-1 text-left border-b border-bgSt/50';

  return (
    <tr key={key}>
      {cells.map((cell, i) => (
        <Tag key={i} className={cellClass}>
          {parseInline(cell, key * 100 + i)}
        </Tag>
      ))}
    </tr>
  );
};

const parseMarkdown = (text: string): ReactNode[] => {
  const lines = text.split('\n');
  const result: ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === '') {
      result.push(<br key={key++} />);
      i++;
      continue;
    }

    // Headers: ### text
    if (/^#{1,4}\s/.test(trimmed)) {
      const headerText = trimmed.replace(/^#{1,4}\s+/, '');
      result.push(
        <div key={key++} className="mt-2 mb-1 font-bold text-white">
          {parseInline(headerText, key * 100)}
        </div>,
      );
      i++;
      continue;
    }

    // Table: detect a block of | ... | lines
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableRows.push(lines[i]);
        i++;
      }

      if (tableRows.length >= 2) {
        const headerRow = tableRows[0];
        const hasSeparator = tableRows.length >= 2 && isTableSeparator(tableRows[1]);
        const dataStartIndex = hasSeparator ? 2 : 1;

        result.push(
          <div key={key++} className="my-2 overflow-x-auto">
            <table className="w-full text-xs">
              {hasSeparator && (
                <thead>{parseTableRow(headerRow, key++, true)}</thead>
              )}
              <tbody>
                {(hasSeparator ? tableRows.slice(dataStartIndex) : tableRows).map((row) =>
                  isTableSeparator(row) ? null : parseTableRow(row, key++, false),
                )}
              </tbody>
            </table>
          </div>,
        );
        continue;
      }

      // Not a real table, fall through to inline parsing
      tableRows.forEach((row) => {
        result.push(<div key={key++}>{parseInline(row, key * 100)}</div>);
      });
      continue;
    }

    // List items: * text or - text
    if (/^[*-]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[*-]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[*-]\s+/, ''));
        i++;
      }

      result.push(
        <ul key={key++} className="my-1 ml-4 list-disc">
          {listItems.map((item) => (
            <li key={key++}>{parseInline(item, key * 100)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Regular text line — parse inline markdown
    result.push(
      <div key={key++}>{parseInline(line, key * 100)}</div>,
    );
    i++;
  }

  return result;
};

export default parseMarkdown;
