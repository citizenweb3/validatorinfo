import OurManifestoModal from '@/app/about/modals/our-manifesto-modal';
import OurToolsModal from '@/app/about/modals/our-tools-modal';
import SubTitle from '@/components/common/sub-title';

export default function Home() {
  return (
    <div>
      <SubTitle text="Useful Info" />
      <div className="mt-4 border-b border-bgSt py-4 text-base">
        ValidatorInfo is a multichain, validator-centric aggregator and explorer, and a future dashboard, that will
        allow users and validators to use their web3 wallets to login and interact with the application.
        <br />
        Our goal is to help stakers, web3 users and any holder of a POS token to discover more information about the
        validators that are securing their favourite network, or - use our explorer to find the most relevent
        information one needs.
        <br />
        <br />
        Validator info is created by Citizen Web3.
        <br />
        <br />
        Citizen Web3, as a project started in 2020, finding roots in ancap vibes, personal values of building a better
        society, ecosystem development and networking. Today, Citizen Web3 is an active member of the web3 galaxy. We
        provide, non-custodial, infrastructure as a validator across the blockchain space, which allows us to work on
        various public goods projects and contribute to the development of web3.
      </div>
      <div className="flex flex-row space-x-32">
        <div>
          <SubTitle text="Our tools" size="h3" />
          <OurToolsModal />
        </div>
        <div>
          <SubTitle text="Our Manifesto" size="h3" />
          <OurManifestoModal />
        </div>
      </div>
    </div>
  );
}
