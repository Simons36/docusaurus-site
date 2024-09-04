import React, { useEffect, useRef } from 'react';
import TypeIt from 'typeit';

const Typewriter = ({ text, options, ...props }) => {
  const typeItInstance = useRef(null);

  useEffect(() => {
    // Ensure that we only initialize TypeIt once
    if (!typeItInstance.current) {
      typeItInstance.current = new TypeIt({
        ...options,
        strings: options.strings || [text], // Use provided text as default if no strings array
      }).go();
    }

    return () => {
      // Cleanup TypeIt instance on component unmount
      if (typeItInstance.current) {
        typeItInstance.current.destroy();
        typeItInstance.current = null;
      }
    };
  }, [text, options]);

  return <span {...props} />;
};

export default Typewriter;
