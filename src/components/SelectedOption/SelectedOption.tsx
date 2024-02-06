import React, { FC } from 'react';

import './SelectedOption.scss';

type SelectedOptionProps = {
  name: string;
  onClickRemoveButton: () => void;
};

const SelectedOption: FC<SelectedOptionProps> = ({ name, onClickRemoveButton }) => {
  return (
    <div className="selected-option">
      <span>{name}</span>
      <button className="selected-option__remove-button" onClick={onClickRemoveButton}>X</button>
    </div>
  );
};

export default SelectedOption;
