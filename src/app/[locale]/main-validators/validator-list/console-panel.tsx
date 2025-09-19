'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import TextLink from '@/components/common/text-link';
import { emitWindowEvent } from '@/hooks/useWindowEvent';

const ConsolePanel = () => {
  const t = useTranslations('HomePage.ConsolePanel');
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="relative aspect-[1000/2100] h-full w-full rounded-lg">
        <Image
          src="/img/stories/main-story.png"
          width={904}
          height={1856}
          alt="main-story"
          className="object-cover object-center"
          priority
        />

        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: '3%',
            zIndex: 1,
            width: '100%',
            height: '11%',
          }}
          onMouseEnter={() => emitWindowEvent('section:hover', 'navbar-arrow')}
          onMouseLeave={() => emitWindowEvent('section:hover', null)}
        >
          <div className="h-full w-full pl-[18%] pt-[6%]">
            <h3 className="font-handjet text-lg text-highlight">{t('Get started.title')}</h3>
            <p className="font-sfpro text-sm">{t('Get started.text')}</p>
          </div>
        </div>

        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: '15%',
            zIndex: 1,
            width: '100%',
            height: '10%',
          }}
          onMouseEnter={() => emitWindowEvent('section:hover', 'header')}
          onMouseLeave={() => emitWindowEvent('section:hover', null)}
        >
          <div className="h-full w-full pl-[28%] pt-[5%]">
            <h3 className="font-handjet text-lg text-highlight">{t('Search and navigation.title')}</h3>
            <div className="font-sfpro text-sm">
              {t.rich('Search and navigation.text', {
                br: () => <br />,
                searchImg: () => (
                  <span className="icon-wrap">
                    <span className="icon" aria-hidden>
                      <div className="inline-block h-6 w-6 bg-search bg-contain align-[-.125em] hover:bg-search_h" />
                    </span>
                  </span>
                ),
                mainPageImg: () => (
                  <span className="icon-wrap">
                    <span className="icon" aria-hidden>
                      <Link
                        href="/"
                        onClick={() => {
                          if (pathname === '/') {
                            window.location.reload();
                          }
                        }}
                      >
                        <Image
                          src="/img/logo.svg"
                          alt="validatorinfo.com logo"
                          width={186}
                          height={174}
                          className="inline-block w-6 hover:brightness-125"
                        />
                      </Link>
                    </span>
                  </span>
                ),
                logInImg: () => (
                  <span className="icon-wrap">
                    <span className="icon" aria-hidden>
                      <Link href={'/profile'}>
                        <Image
                          src="/img/avatars/default.png"
                          alt="validatorinfo.com web3 login button"
                          width={62}
                          height={58}
                          className="inline-block w-6 hover:brightness-125"
                        />
                      </Link>
                    </span>
                  </span>
                ),
              })}
            </div>
          </div>
        </div>

        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: '27%',
            zIndex: 1,
            width: '100%',
            height: '10%',
          }}
          onMouseEnter={() => emitWindowEvent('section:hover', 'tabs')}
          onMouseLeave={() => emitWindowEvent('section:hover', null)}
        >
          <div className="h-full w-full pl-[27%] pt-[3%]">
            <h3 className="font-handjet text-lg text-highlight">{t('Main page.title')}</h3>
            <div className="font-sfpro text-sm">
              {t.rich('Main page.text', {
                br: () => <br />,
                comparisonLink: (chunks) => <TextLink content={chunks} href="/comparevalidators" />,
                calculateLink: (chunks) => <TextLink content={chunks} href="/stakingcalculator" />,
                rumorLink: (chunks) => <TextLink content={chunks} href="/p2pchat" />,
                analyzeLink: (chunks) => <TextLink content={chunks} href="/web3stats" />,
              })}
            </div>
          </div>
        </div>

        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: '38%',
            zIndex: 1,
            width: '100%',
            height: '11%',
          }}
          onMouseEnter={() => emitWindowEvent('section:hover', 'navbar')}
          onMouseLeave={() => emitWindowEvent('section:hover', null)}
        >
          <div className="h-full w-full pl-[26%] pt-[5%]">
            <h3 className="font-handjet text-lg text-highlight">
              {t.rich('Networks.title', {
                networksLink: (chunks) => <TextLink content={chunks} href="/networks" />,
              })}
            </h3>
            <div className="font-sfpro text-sm">
              {t.rich('Networks.text', {
                br: () => <br />,
              })}
            </div>
          </div>
        </div>

        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: '48%',
            zIndex: 1,
            width: '100%',
            height: '11%',
          }}
          onMouseEnter={() => emitWindowEvent('section:hover', 'navbar')}
          onMouseLeave={() => emitWindowEvent('section:hover', null)}
        >
          <div className="h-full w-full pl-[9%] pt-[9%]">
            <h3 className="font-handjet text-lg text-highlight">
              {t.rich('Validators nodes and mining pools.title', {
                validatorsLink: (chunks) => <TextLink content={chunks} href="/validators" />,
                nodesLink: (chunks) => <TextLink content={chunks} href="/nodes" />,
              })}
            </h3>
            <div className="font-sfpro text-sm">{t('Validators nodes and mining pools.text')}</div>
          </div>
        </div>

        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: '60%',
            zIndex: 1,
            width: '100%',
            height: '11%',
          }}
          onMouseEnter={() => emitWindowEvent('section:hover', 'navbar')}
          onMouseLeave={() => emitWindowEvent('section:hover', null)}
        >
          <div className="h-full w-full pl-[25%] pt-[7%]">
            <h3 className="font-handjet text-lg text-highlight">
              {t.rich('Ecosystems and metrics.title', {
                ecosystemsLink: (chunks) => <TextLink content={chunks} href="/ecosystems" />,
              })}
            </h3>
            <div className="font-sfpro text-sm">{t('Ecosystems and metrics.text')}</div>
          </div>
        </div>

        <div className="absolute left-[13%] top-[73.5%]">
          <h3 className="font-handjet text-lg text-highlight">{t('More features.title')}</h3>
          <div className="font-sfpro text-sm">
            {t.rich('More features.text', {
              br: () => <br />,
              libraryImg: () => (
                <span className="icon-wrap">
                  <span className="icon" aria-hidden>
                    <Link href={'/library'}>
                      <Image
                        src="/img/icons/navbar/library.png"
                        alt="library logo"
                        width={186}
                        height={174}
                        className="inline-block w-6"
                        priority
                      />
                    </Link>
                  </span>
                </span>
              ),
              aiImg: () => (
                <span className="icon-wrap">
                  <span className="icon" aria-hidden>
                    <Link href={'/ai'}>
                      <Image
                        src="/img/icons/rabbit.png"
                        alt="ai logo"
                        width={186}
                        height={174}
                        className="inline-block w-7 align-[-.65em] hover:brightness-125"
                        priority
                      />
                    </Link>
                  </span>
                </span>
              ),
              rumorsImg: () => (
                <span className="icon-wrap">
                  <span className="icon" aria-hidden>
                    <Link href={'/p2pchat'}>
                      <Image
                        src="/img/icons/navbar/rumors.png"
                        alt="rumor logo"
                        width={186}
                        height={174}
                        className="inline-block w-6 align-[-.125em] hover:brightness-125"
                        priority
                      />
                    </Link>
                  </span>
                </span>
              ),
              logInImg: () => (
                <span className="icon-wrap">
                  <span className="icon" aria-hidden>
                    <Link href={'/profile'}>
                      <Image
                        src="/img/avatars/default.png"
                        alt="validatorinfo.com web3 login button"
                        width={62}
                        height={58}
                        className="inline-block w-6 hover:brightness-125"
                      />
                    </Link>
                  </span>
                </span>
              ),
            })}
          </div>
        </div>
        <div className="absolute bottom-0 h-[20%] w-full">
          <div className="absolute bottom-[40%] left-[10%] h-28 w-28 bg-d_pad bg-contain bg-center bg-no-repeat" />

          <div className="absolute bottom-[25%] left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center gap-[30%]">
            <div className="flex flex-row items-end">
              <div className="h-16 w-16 bg-gameboy_start bg-contain bg-center bg-no-repeat hover:bg-gameboy_start_h active:bg-gameboy_start_a" />
              <span className="-ml-8 mb-1 -rotate-45 font-handjet text-base">SELECT</span>
            </div>
            <div className="flex flex-row items-end">
              <div className="h-16 w-16 bg-gameboy_start bg-contain bg-center bg-no-repeat hover:bg-gameboy_start_h active:bg-gameboy_start_a" />
              <span className="-ml-8 mb-1 -rotate-45 font-handjet text-base">START</span>
            </div>
          </div>

          <div className="absolute right-[6%] bottom-[35%] flex items-center gap-[3%]">
            <div className="flex flex-row items-end">
              <div className="h-16 w-16 bg-gameboy_b_btn bg-contain bg-center bg-no-repeat hover:bg-gameboy_b_btn_h active:bg-gameboy_b_btn_a" />
              <span className="-rotate-45 font-handjet text-lg -mb-5">B</span>
            </div>
            <div className="flex flex-row items-end pb-20">
              <div className="h-16 w-16 bg-gameboy_a_btn bg-contain bg-center bg-no-repeat hover:bg-gameboy_a_btn_h active:bg-gameboy_a_btn_a" />
              <span className="-rotate-45 font-handjet text-lg -mb-5">A</span>
            </div>
          </div>
          <div className="absolute right-[2%] bottom-[7%] h-36 w-36 bg-loudspeaker bg-contain bg-no-repeat" />
        </div>
      </div>
    </div>
  );
};

export default ConsolePanel;
