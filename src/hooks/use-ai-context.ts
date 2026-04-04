'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { PageContext } from '@/types/ai-chat';
import { SAFE_NAME, SAFE_HASH } from '@/types/ai-chat';

export type { PageContext } from '@/types/ai-chat';

const sanitize = (value: string, pattern: RegExp): string | undefined =>
  pattern.test(value) ? value : undefined;

export const useAiContext = (): PageContext => {
  const pathname = usePathname();

  return useMemo(() => {
    // Remove locale prefix (e.g. /en/networks/... -> /networks/...)
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments.length > 0 && segments[0].length === 2 ? segments[0] : 'en';
    const localeRemoved = segments.length > 0 && segments[0].length === 2 ? segments.slice(1) : segments;

    // Default context
    const context: PageContext = { locale, page: 'home' };

    if (localeRemoved.length === 0) {
      return context;
    }

    // Parse /networks/{name}/... routes
    if (localeRemoved[0] === 'networks' && localeRemoved.length >= 2) {
      context.chainName = sanitize(localeRemoved[1], SAFE_NAME);
      context.page = 'overview';

      if (localeRemoved.length >= 3) {
        const section = localeRemoved[2];

        switch (section) {
          case 'validators':
            context.page = 'validators';
            if (localeRemoved[3]) {
              context.validatorAddress = sanitize(localeRemoved[3], SAFE_HASH);
              context.page = 'validator-detail';
            }
            break;
          case 'proposal':
            context.page = 'governance';
            if (localeRemoved[3]) {
              context.proposalId = sanitize(localeRemoved[3], SAFE_NAME);
              context.page = 'proposal-detail';
            }
            break;
          case 'blocks':
            context.page = 'blocks';
            if (localeRemoved[3]) {
              context.blockHash = sanitize(localeRemoved[3], SAFE_HASH);
              context.page = 'block-detail';
            }
            break;
          case 'tx':
            context.page = 'transactions';
            if (localeRemoved[3]) {
              context.txHash = sanitize(localeRemoved[3], SAFE_HASH);
              context.page = 'transaction-detail';
            }
            break;
          case 'nodes':
            context.page = 'nodes';
            break;
          case 'address':
            context.page = 'address';
            break;
          default:
            context.page = section;
            break;
        }
      }

      return context;
    }

    // Parse /validators/{id}/... routes
    if (localeRemoved[0] === 'validators' && localeRemoved.length >= 2) {
      context.validatorId = sanitize(localeRemoved[1], SAFE_NAME);
      context.page = localeRemoved[2] || 'validator-profile';
      return context;
    }

    // Non-network pages
    context.page = localeRemoved.join('/');
    return context;
  }, [pathname]);
};
