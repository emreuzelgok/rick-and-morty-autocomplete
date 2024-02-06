/* eslint-disable @next/next/no-img-element */
import React, { FC, useEffect, useRef } from 'react';
import cx from 'classnames';

import './Option.scss';
import useIsVisible from '../../hooks/useIsVisible';

type OptionProps = {
  selected?: boolean;
  focused?: boolean;
  query?: string; 
  name: string;
  episodes: number;
  image?: string;
  onClickOption: () => void;
  index: number;
};

const Option: FC<OptionProps> = ({ selected, focused, name, episodes, onClickOption, image, query, index }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(containerRef);
  const nameParts = name.split(new RegExp(`(${query})`, 'gi'));
  
  useEffect(() => {
    if (!isVisible && focused) {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [isVisible, focused]);

  const classNames = cx('option', `option-${index}`, {
    'option--focused': focused,
  })

  return (
    <div className={classNames} onClick={onClickOption} ref={containerRef}>
      <input className="option__checkbox" tabIndex={-1} type="checkbox" checked={selected} />
      <img className="option__image" src={image} alt="" />
      <div className="option__info">
        <div className="option__name">
          {nameParts.map((item, index) =>{
            if (item.toLowerCase() === query?.toLowerCase()) {
              return <strong key={`tp-${index}`}>{item}</strong>
            }
            return <span key={`tp-${index}`}>{item}</span>
          })}
        </div>
        <div className="option__episodes">{episodes} Episodes</div>
      </div>
    </div>
  );
};

export default Option;
