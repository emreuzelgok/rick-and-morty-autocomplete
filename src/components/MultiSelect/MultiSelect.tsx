import React, { ChangeEvent, FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import SelectedOption from '../SelectedOption';
import Option from '../Option';
import { FaCaretDown } from 'react-icons/fa';
import './MultiSelect.scss';
import axios from 'axios';
import Loading from '../Loading';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import { ApiResponse, Character } from '@/types';


const SEARCH_MESSAGE = 'Please type something.';
const SEARCH_NOT_FOUND_MESSAGE = 'No results found!';

const PREVENT_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab'];
const FOCUS_NEXT_KEYS = ['ArrowDown'];
const FOCUS_PREV_KEYS = ['ArrowUp'];

const MultiSelect = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState('');

  const [options, setOptions] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState(SEARCH_MESSAGE);
  const [focusedOption, setFocusedOption] = useState({ focusedIndex: 0, isSelected: false });
  
  const [selectedOptions, setSelectedOptions] = useState<Character[]>([]);

  useOnClickOutside(wrapperRef, () => {
    setShowOptions(false);
  })

  useEffect(() => {
    let abortController: AbortController;
    const search = async (query: string) => {
      abortController = new AbortController();
      try {
        setIsLoading(true);
        const { data } = await axios.get<ApiResponse>(
          `https://rickandmortyapi.com/api/character/?name=${query}`, 
          {
            signal: abortController.signal,
          }
        );
        setFocusedOption({ focusedIndex: 0, isSelected: false });
        setMessage('');
        setOptions(data.results);
      } catch (error) {
        setFocusedOption({ focusedIndex: 0, isSelected: false });
        setMessage(SEARCH_NOT_FOUND_MESSAGE);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }  
    }

    if (query !== '') {
      search(query);
    }
  
    return () => {
      if (abortController) {
        abortController.abort();
      }
    }
  }, [query]);

  const onChangeInputText = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);
    setShowOptions(true);
  }, []);

  const onFocusInputText = useCallback(() => {
    setShowOptions(true);
    setFocusedOption({ isSelected: false, focusedIndex: 0 });
  }, []);

  const focusTextInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const toggleOption = useCallback((item: Character, index?: number) => {
    inputRef.current?.focus();

    if (index) {
      setFocusedOption({ focusedIndex: index, isSelected: false });
    }

    if (selectedOptions.find((selected) => selected.id === item.id)) {
      setSelectedOptions(prev => prev.filter((selected) => selected.id !== item.id));
      return;
    }
    
    setSelectedOptions(prev => ([...prev, item]));
  }, [selectedOptions]);

  const selectPrevOption = useCallback(() => {
    setFocusedOption(prev => {
      let newFocusedIndex = prev.focusedIndex - 1;
      let isSelected = prev.isSelected;

      if (newFocusedIndex < 0) {
        if (!isSelected && !!selectedOptions.length) {
          isSelected = true;
          newFocusedIndex = selectedOptions.length - 1;
        } else if (isSelected && !!options.length){
          isSelected = false;
          newFocusedIndex = options.length - 1;
        } else if (!isSelected && !!options.length) {
          newFocusedIndex = options.length - 1;
        }
      }

      if (newFocusedIndex < 0) {
        newFocusedIndex = 0;
      }

      return {
        focusedIndex: newFocusedIndex,
        isSelected,
      }
    });
  }, [selectedOptions, options])

  const selectNextOption = useCallback(() => {
    setFocusedOption(prev => {
      let newFocusedIndex = prev.focusedIndex + 1;
      let isSelected= prev.isSelected;

      if (!isSelected && newFocusedIndex > options.length - 1) {
        isSelected = true;
        newFocusedIndex = 0;
      } else if (isSelected && newFocusedIndex > selectedOptions.length - 1) {
        isSelected = false;
        newFocusedIndex = 0;
      }
      
      return {
        focusedIndex: newFocusedIndex,
        isSelected,
      }
    })
  }, [options, selectedOptions]);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (PREVENT_KEYS.includes(e.key)) {
      e.preventDefault();
    }

    if (FOCUS_NEXT_KEYS.includes(e.key)) {
      selectNextOption();
    }

    if (FOCUS_PREV_KEYS.includes(e.key)) {
      selectPrevOption();
    }

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        selectPrevOption();
        return;
      }
      selectNextOption();
    }

    // Toggle element

    if (e.key === 'Enter') {
      // Toggle element from options
      let currentCharacter: Character; 

      if (!focusedOption.isSelected) {
        currentCharacter = options[focusedOption.focusedIndex];
      } else {
        currentCharacter = selectedOptions[focusedOption.focusedIndex];
      }
      if (currentCharacter) {
        toggleOption(currentCharacter);
      }
      return;
    }

    if (e.key === 'Backspace' && query === '') {
      setSelectedOptions(prev => ([ ...prev.slice(0, prev.length - 1) ]))  
    }

    if (e.key === 'Escape') {
      setShowOptions(false);
    }
  }, [focusedOption, toggleOption, options, query, selectNextOption, selectPrevOption, selectedOptions]);

  return (
    <div className="multi-select" ref={wrapperRef}>
      <div className="multi-select__values" onClick={focusTextInput}>
        {selectedOptions.map(((selectedOption, index) => (
          <SelectedOption 
            name={selectedOption.name}
            onClickRemoveButton={() => toggleOption(selectedOption)}
            key={selectedOption?.id}
            focused={focusedOption.focusedIndex === index && focusedOption.isSelected}
          />
        )))}
        <div className="multi-select__arrow">
          <FaCaretDown />
        </div>
        <input
          className="multi-select__search-input"
          type="text"
          ref={inputRef}
          onKeyDown={onKeyDown}
          onFocus={onFocusInputText}
          onChange={onChangeInputText}
        />
      </div>
      <div className="multi-select__options-wrapper">
        {showOptions && (
          <div className="multi-select__options">
            {!isLoading && message && <div className="multi-select__message">{message}</div>}
            {isLoading && <Loading/>}
            {!isLoading && options.map((option, index) => (
              <Option
                key={index}
                index={index}
                selected={!!selectedOptions.find(item => item.id === option.id)}
                focused={index === focusedOption.focusedIndex && !focusedOption.isSelected}
                name={option.name}
                image={option.image}
                episodes={option?.episode.length}
                query={query}
                onClickOption={() => toggleOption(option, index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
