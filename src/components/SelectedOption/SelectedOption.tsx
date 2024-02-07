import React, { FC } from 'react';
import cx from 'classnames';

import './SelectedOption.scss';

type SelectedOptionProps = {
  name: string;
  onClickRemoveButton: () => void;
  focused?: boolean;
};

const SelectedOption: FC<SelectedOptionProps> = ({ name, onClickRemoveButton, focused }) => {
  const classNames = cx('selected-option', {
    'selected-option--focused': focused,
  });

  return (
    <div className={classNames}>
      <span>{name}</span>
      <button className="selected-option__remove-button" onClick={onClickRemoveButton}>X</button>
    </div>
  );
};

export default SelectedOption;
