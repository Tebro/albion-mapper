import clone from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import startsWith from 'lodash/startsWith';
import React, { FC, useCallback, useRef, useState } from 'react';

import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useEventListener from '@use-it/event-listener';

import { DEFAULT_ZONE } from '../data/constants';
import { ZoneLight } from '../types';

interface ZoneSearchProps {
  zoneList: ZoneLight[];
  label: string;
  value: ZoneLight;
  update: (zone: ZoneLight) => void;
}
const filterZones = (zoneList: ZoneLight[], state: object) => {
  const newZoneList: ZoneLight[] = [];
  const inputVal: string = (state as any).inputValue.toLowerCase();

  for (const z of zoneList) {
    // lodash is faster than native implementation
    if (startsWith(z.value, inputVal)) {
      newZoneList.push(z);
    }
  }

  return newZoneList;
};

const getMaxStrLen = (curList: ZoneLight[], maxStr: number): number => {
  if (curList.length === 1) {
    return curList[0].value.length;
  }

  const base = curList[0].value;

  for (let i = 1; i < curList.length; i++) {
    if (
      !curList[i] ||
      base.substr(0, maxStr + 1) !== curList[i].value.substr(0, maxStr + 1)
    ) {
      break;
    }

    ++maxStr;
  }

  if (
    base.length !== maxStr &&
    base.substr(0, maxStr + 1) ===
      curList[curList.length - 1].value.substr(0, maxStr + 1)
  ) {
    return getMaxStrLen(curList, maxStr + 1);
  }

  return maxStr;
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
        const maxStringLen = getMaxStrLen(currentZoneList, currentVal.length);

        setCurrentInput(currentZoneList[0].name.substr(0, maxStringLen));
      }
    },
    [currentZoneList, currentInput]
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
      filterOptions={(options: ZoneLight[], state: object) => {
        const filteredZones = filterZones(options, state);

        if (currentInput && !isEqual(filteredZones, currentZoneList)) {
          setCurrentZoneList(clone(filteredZones));
        }

        return filteredZones;
      }}
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
