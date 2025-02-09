import {getTranslations} from 'next-intl/server';
import {FC} from 'react';

import {networkProfileExample} from '@/app/networks/[id]/networkProfileExample';
import Image from "next/image";
import cutHash from "@/utils/cut-hash";
import SubTitle from "@/components/common/sub-title";
import Link from "next/link";

interface OwnProps {
}

const LiveProposals: FC<OwnProps> = async ({}) => {
    const t = await getTranslations('NetworkGovernance');

    return (
        <>
            <SubTitle text={t('Live Proposals')}/>
            <div className="grid grid-cols-2 gap-x-10">
                {networkProfileExample.liveProposals.map((item) => (
                    <div key={item.proposalNumber} className="mt-2 flex w-full">
                        <div
                            className="w-3/5 text-base">
                            <div className="mb-4">
                                <span
                                    className="font-handjet text-highlight text-lg">#{item.proposalNumber}&nbsp;
                                </span>
                                - {item.proposalTitle}
                            </div>
                            <div>
                                {t(`${item.proposer.title as 'proposer'}`)}:&nbsp;
                                <Link href="" className="underline font-handjet">{cutHash({
                                    value: item.proposer.data,
                                    cutLength: 10
                                })}
                                </Link>
                            </div>
                            <div className="mt-0.5">
                                {t(`${item.votingStart.title as 'voting start'}`)}:&nbsp;
                                <span className="font-handjet">
                                    {item.votingStart.data}
                                </span>
                            </div>
                            <div className="mt-0.5">
                                {t(`${item.votingEnd.title as 'voting end'}`)}:&nbsp;
                                <span
                                    className="font-handjet">{item.votingEnd.data}
                                </span>
                            </div>
                            <div className="mt-0.5">
                                {t(`${item.remainingTime.title as 'remaining time'}`)}:&nbsp;
                                <span
                                    className="font-handjet">{item.remainingTime.data}
                                </span>
                            </div>
                        </div>
                        <div
                            className="w-2/5">
                            <Image
                                src={'/img/charts/voting-period-circle.svg'}
                                width={300}
                                height={150}
                                alt="voting period"
                                className=""
                            />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default LiveProposals;
