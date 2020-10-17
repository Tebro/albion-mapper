import clone from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import startsWith from 'lodash/startsWith'; // lodash is faster than native implementation
import React, { FC, useCallback, useRef, useState } from 'react';

import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { DEFAULT_ZONE } from '../data/constants';
import useEventListener from '../utils/hooks/useEventListener';
import { ZoneLight } from './';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete';

interface ZoneSearchProps {
  zoneList: ZoneLight[];
  label: string;
  value: ZoneLight;
  update: (zone: ZoneLight) => void;
}

const filterZones = (
  zoneList: ZoneLight[],
  state: FilterOptionsState<ZoneLight>
) => {
  const inputVal: string = state.inputValue.toLowerCase();

  const newZoneList = zoneList.filter((z) => startsWith(z.value, inputVal));

  if (newZoneList.length) {
    return newZoneList;
  }

  const inputTerms = inputVal.split(' ');

  return inputTerms.reduce(
    (list: ZoneLight[], term) => list.filter((i) => i.value.indexOf(term) >= 0),
    zoneList
  );
};

const getMaxString = (curList: ZoneLight[], input: string): string => {
  if (curList.length === 1) {
    return curList[0].name;
  }

  const lowInput = input.toLowerCase();

  if (curList.every((z) => startsWith(z.name.toLowerCase(), lowInput))) {
    return getMaxString(curList, curList[0].name.substr(0, input.length + 1));
  }

  return curList[0].name.substr(0, input.length - 1);
};

const ZoneSearch: FC<ZoneSearchProps> = ({
  zoneList,
  label,
  value,
  update,
}) => {
  const acRef = useRef(null);
  const [currentZoneList, setCurrentZoneList] = useState<ZoneLight[]>(zoneList);
  const [currentInput, setCurrentInput] = useState<string>(value.name);

  const keyEventHandler = useCallback(
    (e: KeyboardEvent) => {
      const currentVal = currentInput;

      if (e.code.toLowerCase() === 'arrowright' && currentVal) {
        setCurrentInput(getMaxString(currentZoneList, currentInput));
      }
    },
    [currentZoneList, currentInput]
  );

  const filterOptions = useCallback(
    (
      options: ZoneLight[],
      state: FilterOptionsState<ZoneLight>
    ): ZoneLight[] => {
      const filteredZones = filterZones(options, state);

      if (currentInput && !isEqual(filteredZones, currentZoneList)) {
        setCurrentZoneList(clone(filteredZones));
      }

      return filteredZones;
    },
    [currentInput, currentZoneList]
  );

  useEventListener('keydown', keyEventHandler, acRef.current);

  return (
    <Autocomplete
      ref={acRef}
      options={zoneList}
      noOptionsText="no valid zones found"
      fullWidth
      autoSelect
      autoHighlight
      includeInputInList
      value={value}
      inputValue={currentInput}
      onInputChange={(_, value) => setCurrentInput(value)}
      filterOptions={filterOptions}
      getOptionSelected={(o: ZoneLight, val: ZoneLight) =>
        o.value === val.value
      }
      getOptionLabel={(o: ZoneLight) => o.name}
      onChange={(_, val: ZoneLight | null) => update(val ?? DEFAULT_ZONE)}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default ZoneSearch;
