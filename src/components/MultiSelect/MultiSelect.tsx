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
  const [focusedIndex, setFocusedIndex] = useState(0);
  
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
        setFocusedIndex(0);
        setMessage('');
        setOptions(data.results);
      } catch (error) {
        setFocusedIndex(0);
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
    setFocusedIndex(0);
  }, []);

  const focusTextInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const onClickOption = useCallback((item: Character, index?: number) => {
    inputRef.current?.focus();

    if (index) {
      setFocusedIndex(index);
    }

    if (selectedOptions.find((selected) => selected.id === item.id)) {
      setSelectedOptions(prev => prev.filter((selected) => selected.id !== item.id));
      return;
    }
    
    setSelectedOptions(prev => ([...prev, item]));
  }, [selectedOptions]);

  const selectPrevOption = useCallback(() => {
    setFocusedIndex(prev => {
      if (prev !== 0) {
        return prev - 1;
      }
      return 0;
    });
  }, []);

  const selectNextOption = useCallback(() => {
    setFocusedIndex(prev => {
      if (prev > options.length - 2) {
        return 0;
      }
      return prev + 1
    });
  }, [options]);

  

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
      const currentCharacter = options[focusedIndex];
      if (currentCharacter) {
        onClickOption(currentCharacter);
      }
    }

    if (e.key === 'Backspace') {
      if (query === '') {
        setSelectedOptions(prev => ([ ...prev.slice(0, prev.length - 1) ]))  
      }
    }

    if (e.key === 'Escape') {
      setShowOptions(false);
    }
  }, [focusedIndex, onClickOption, options, query, selectNextOption, selectPrevOption]);

  return (
    <div className="multi-select" ref={wrapperRef}>
      <div className="multi-select__values" onClick={focusTextInput}>
        {selectedOptions.map(((selectedOption) => (
          <SelectedOption 
            name={selectedOption.name}
            onClickRemoveButton={() => onClickOption(selectedOption)}
            key={selectedOption?.id}
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
                focused={index === focusedIndex}
                name={option.name}
                image={option.image}
                episodes={option?.episode.length}
                query={query}
                onClickOption={() => onClickOption(option, index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
