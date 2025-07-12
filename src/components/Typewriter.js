import React, { useEffect, useRef } from 'react';
import TypeIt from 'typeit';
import useIsBrowser from '@docusaurus/useIsBrowser';

const Typewriter = ({ text, options, ...props }) => {
  const isBrowser = useIsBrowser();
  const elRef = useRef(null);
  const typeItInstance = useRef(null);

  useEffect(() => {
    if (!isBrowser) return;

    if (elRef.current && !typeItInstance.current) {
      typeItInstance.current = new TypeIt(elRef.current, {
        ...options,
        strings: options?.strings || [text],
      }).go();
    }

    return () => {
      if (typeItInstance.current) {
        typeItInstance.current.destroy();
        typeItInstance.current = null;
      }
    };
  }, [text, options, isBrowser]);

  return <span ref={elRef} {...props} />;
};

export default Typewriter;
