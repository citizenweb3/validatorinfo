'use client';

import { useCallback, useState } from 'react';

import OurManifestoModal from '@/app/about/modals/our-manifesto-modal';
import OurToolsModal from '@/app/about/modals/our-tools-modal';

type ActiveModal = 'tools' | 'manifesto' | null;

const AboutModalsGroup = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const closeAll = useCallback(() => setActiveModal(null), []);
  const openTools = useCallback(() => setActiveModal('tools'), []);
  const openManifesto = useCallback(() => setActiveModal('manifesto'), []);

  return (
    <div className="mt-20 flex w-full flex-row justify-center space-x-32">
      <div>
        <OurToolsModal isOpen={activeModal === 'tools'} onOpen={openTools} onClose={closeAll} />
      </div>
      <div>
        <OurManifestoModal
          isOpen={activeModal === 'manifesto'}
          onOpen={openManifesto}
          onClose={closeAll}
        />
      </div>
    </div>
  );
};

export default AboutModalsGroup;
