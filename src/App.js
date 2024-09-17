import React, { useState, useEffect } from 'react';

const NumberPattern = ({
  number,
  onPatternChange,
  isStatic,
  conflictColumns,
  computeOrder,
  onComputeOrderChange,
  baseValue,
  periodicInterval,
  patternType,
  instances,
  patternShift,
  onBaseValueChange,
  onPeriodicIntervalChange,
  onPatternTypeChange,
  onInstancesChange,
  onPatternShiftChange,
  onReset,
}) => {
  const generatePattern = () => {
    let pattern = [];
    let currentPos = patternShift >= 0 ? patternShift : 0;
    for (let n = 0; n < instances; n++) {
      // Calculate space between instances based on pattern type
      let space;
      switch (patternType) {
        case 'Quadratic':
          space = Math.pow(baseValue + n, 2);
          break;
        case 'Cubic':
          space = Math.pow(baseValue + n, 3);
          break;
        default: // 'Linear'
          space = baseValue + n;
      }
      space *= periodicInterval; // Apply periodic interval

      if (n > 0) {
        currentPos += space;
      }

      pattern.push({ value: number, instance: n, position: currentPos });
    }
    return pattern;
  };

  const [pattern, setPattern] = useState(generatePattern());

  useEffect(() => {
    setPattern(generatePattern());
  }, [baseValue, periodicInterval, patternType, instances, patternShift]);

  const generatePythonList = () => {
    const maxLength = 1000; // Adjust as needed
    const pythonList = Array(maxLength).fill('None');
    pattern.forEach((item) => {
      if (
        item.value !== undefined &&
        item.position >= 0 && // Ensure position is non-negative
        item.position < maxLength
      ) {
        pythonList[item.position] = number;
      }
    });
    return pythonList;
  };

  const pythonList = generatePythonList();

  useEffect(() => {
    onPatternChange(number, pythonList);
  }, [pattern]);

  const handleDrag = (e, index) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue = index === 0 ? baseValue : patternShift;
    const handleMove = (e) => {
      const diff = Math.round((e.clientX - startX) / 10);
      if (index === 0) onBaseValueChange(startValue + diff);
      else onPatternShiftChange(startValue + diff);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener(
      'mouseup',
      () => document.removeEventListener('mousemove', handleMove),
      { once: true }
    );
  };

  // Calculate segment lengths
  const calculateSegmentLengths = () => {
    const indices = pattern
      .filter((item) => item.value !== undefined)
      .map((item) => item.position);
    return indices.map((pos, idx) => {
      if (idx === 0) return pos + 1;
      return pos - indices[idx - 1];
    });
  };

  return (
    <div className="mb-4 flex items-center">
      <div
        className="w-8 h-8 flex items-center justify-center mr-2 cursor-pointer"
        onClick={() => onComputeOrderChange(number)}
        style={{
          border: '2px solid white',
          borderRadius: '4px',
          backgroundColor: computeOrder ? 'blue' : 'transparent',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {computeOrder || ''}
      </div>
      <div className="flex-grow">
        <div className="flex items-center flex-wrap text-white mb-2">
          <span className="w-8 font-bold mr-2">{number}:</span>
          {/* Instances Slider */}
          <div className="flex items-center mr-2">
            <span className="text-xs mr-1">Instances:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={instances}
              onChange={(e) => onInstancesChange(parseInt(e.target.value))}
              className="w-24 h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          {/* Periodic Interval Slider */}
          <div className="flex items-center mr-2">
            <span className="text-xs mr-1">Periodic:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={periodicInterval}
              onChange={(e) => onPeriodicIntervalChange(parseInt(e.target.value))}
              className="w-24 h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          {/* Pattern Type Selector */}
          <div className="flex items-center mr-2">
            <span className="text-xs mr-1">Pattern:</span>
            <select
              value={patternType}
              onChange={(e) => onPatternTypeChange(e.target.value)}
              className="bg-gray-800 text-white px-2 py-1 rounded"
            >
              <option value="Linear">Linear</option>
              <option value="Quadratic">Quadratic</option>
              <option value="Cubic">Cubic</option>
            </select>
          </div>
          <span className="text-sm w-24">Base Value: {baseValue}</span>
          <button
            onClick={onReset}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
          >
            Reset
          </button>
        </div>

        <div
          className="h-10 relative overflow-hidden whitespace-nowrap border-b border-white"
          style={{
            backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        >
          {pattern.map((item, index) => (
            <React.Fragment key={index}>
              {isStatic && conflictColumns.includes(item.position) && (
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `${item.position * 10}px`,
                    width: '10px',
                    backgroundColor: 'rgba(255, 0, 0, 0.6)',
                    boxShadow: '0 0 10px 5px rgba(255, 0, 0, 0.6)',
                    zIndex: 2,
                  }}
                />
              )}
              {item.value !== undefined && item.position >= 0 && (
                <span
                  className="absolute cursor-move"
                  style={{
                    left: `${item.position * 10}px`,
                    top: '0px',
                    width: '10px',
                    height: '10px',
                    backgroundColor:
                      isStatic && conflictColumns.includes(item.position)
                        ? 'rgb(255, 0, 0)'
                        : 'rgb(255, 255, 0)',
                    border: '1px solid white',
                    zIndex: 3,
                  }}
                  onMouseDown={(e) => handleDrag(e, item.instance)}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Display Python list */}
        <div className="text-white mt-2">
          <pre
            style={{
              color: 'yellow',
              textShadow:
                '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}
          >
            {`python_list_${number} = [${pythonList.join(', ')}]`}
          </pre>
        </div>

        {/* Display Segment Lengths */}
        <div className="text-white mt-2">
          Segment Lengths: {calculateSegmentLengths().join(', ')}
        </div>
      </div>
    </div>
  );
};

const FinalProductRow = ({ finalProductRowList }) => {
  return (
    <div className="mb-4">
      <div className="font-bold mb-2">Final Product Row:</div>
      <div
        className="h-10 relative overflow-hidden whitespace-nowrap border-b border-white"
        style={{
          backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      >
        {finalProductRowList.map(
          (item, index) =>
            item !== 'None' && (
              <span
                key={index}
                className="absolute"
                style={{
                  left: `${index * 10}px`,
                  top: '0px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: `hsl(${(item.value * 30) % 360}, 70%, 50%)`,
                  border: '1px solid white',
                  zIndex: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '6px',
                  color: 'white',
                  fontWeight: 'bold',
                }}
                title={`Value: ${item.value}, Row: ${item.row}`}
              >
                {item.value}
              </span>
            )
        )}
      </div>
      <div className="text-white mt-2 overflow-x-auto">
        <pre
          style={{
            color: 'yellow',
            textShadow:
              '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
          }}
        >
          {`final_product_row = [${finalProductRowList
            .map((item) => (item === 'None' ? 'None' : `${item.value}`))
            .join(', ')}]`}
        </pre>
      </div>
    </div>
  );
};

const ExpandedFinalProductRow = ({ finalProductRowList }) => {
  const distinctValues = [
    ...new Set(
      finalProductRowList
        .filter((item) => item !== 'None')
        .map((item) => item.value)
    ),
  ];

  return (
    <div className="mb-4 overflow-y-auto h-64 border border-white p-2">
      <div className="font-bold mb-2">Expanded Final Product Row:</div>
      {distinctValues.map((value, rowIndex) => (
        <div key={rowIndex} className="mb-4">
          <div
            className="h-10 relative overflow-hidden whitespace-nowrap border-b border-white mb-2"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #333 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          >
            {finalProductRowList.map(
              (item, index) =>
                item !== 'None' &&
                item.value === value && (
                  <span
                    key={index}
                    className="absolute"
                    style={{
                      left: `${index * 10}px`,
                      top: '0px',
                      width: '10px',
                      height: '10px',
                      backgroundColor: `hsl(${(item.row * 30) % 360}, 70%, 50%)`,
                      border: '1px solid white',
                      zIndex: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '6px',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                    title={`Value: ${item.value}, Row: ${item.row}`}
                  >
                    {item.value}
                  </span>
                )
            )}
          </div>
          <div className="text-white mt-2 overflow-x-auto">
            <pre
              style={{
                color: 'yellow',
                textShadow:
                  '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}
            >
              {`python_list_value_${value} = [${finalProductRowList
                .map((item) =>
                  item === 'None' || item.value !== value
                    ? 'None'
                    : `${item.value}`
                )
                .join(', ')}]`}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};

const NumberPatternSliders = () => {
  const [rowCount, setRowCount] = useState(10);
  const [patterns, setPatterns] = useState({});
  const [isStatic, setIsStatic] = useState(false);
  const [conflictColumns, setConflictColumns] = useState([]);
  const [finalProductRowList, setFinalProductRowList] = useState([]);
  const [computeOrder, setComputeOrder] = useState({});
  const [checkAll, setCheckAll] = useState(false); // New state for "Check All"
  const [numberPatternStates, setNumberPatternStates] = useState({}); // State for NumberPatterns
  const maxRows = 50;

  const handlePatternChange = (number, pythonList) => {
    setPatterns((prev) => ({ ...prev, [number]: pythonList }));
  };

  const handleComputeOrderChange = (number) => {
    setComputeOrder((prev) => {
      const newOrder = { ...prev };
      if (newOrder[number]) {
        // Remove the number from the compute order
        const removedOrder = newOrder[number];
        delete newOrder[number];

        // Decrement orders greater than the removed one
        Object.keys(newOrder).forEach((key) => {
          if (newOrder[key] > removedOrder) {
            newOrder[key] -= 1;
          }
        });
      } else {
        // Add to order
        const maxOrder = Math.max(0, ...Object.values(newOrder));
        newOrder[number] = maxOrder + 1;
      }
      return newOrder;
    });
  };

  useEffect(() => {
    if (isStatic) {
      const visiblePatterns = Object.entries(patterns)
        .filter(([key]) => key <= rowCount)
        .map(([_, pattern]) => pattern);
      const allPositions = visiblePatterns.flatMap((pattern) =>
        pattern.map((value, index) => (value !== 'None' ? index : -1))
      );
      const positionCounts = allPositions.reduce((acc, pos) => {
        if (pos !== -1) {
          acc[pos] = (acc[pos] || 0) + 1;
        }
        return acc;
      }, {});
      setConflictColumns(
        Object.keys(positionCounts)
          .filter((pos) => positionCounts[pos] > 1)
          .map(Number)
      );
    } else {
      setConflictColumns([]);
    }
  }, [patterns, isStatic, rowCount]);

  const computeFinalProductRow = () => {
    const visiblePatterns = Object.entries(patterns)
      .filter(([key]) => key <= rowCount)
      .map(([key, pattern]) => ({ row: parseInt(key), pattern }));

    if (visiblePatterns.length === 0) {
      setFinalProductRowList([]);
      return;
    }

    // Sort rows based on computeOrder, then add any unordered visible rows
    const computeOrderEntries = Object.entries(computeOrder).sort(
      (a, b) => a[1] - b[1]
    );
    const orderedRows = computeOrderEntries.map(([row]) => parseInt(row));
    const unorderedRows = visiblePatterns
      .map((p) => p.row)
      .filter((row) => !orderedRows.includes(row));
    const finalOrder = [...orderedRows, ...unorderedRows];

    let result = [];

    for (let rowNumber of finalOrder) {
      const patternObj = visiblePatterns.find((p) => p.row === rowNumber);
      if (!patternObj) continue; // Skip if pattern not found
      const { pattern } = patternObj;

      const indices = pattern
        .map((value, index) => (value !== 'None' ? index : -1))
        .filter((index) => index !== -1);

      const segmentLengths = indices.map((pos, idx) => {
        if (idx === 0) return pos + 1;
        return pos - indices[idx - 1];
      });

      let currentInsertIndex = 0;
      let undefinedCount = 0;

      for (let j = 0; j < indices.length; j++) {
        const segmentLength = segmentLengths[j];

        // Move to the nth next undefined slot in result
        undefinedCount = 0;
        while (
          undefinedCount < segmentLength &&
          currentInsertIndex < result.length
        ) {
          if (result[currentInsertIndex] === 'None') {
            undefinedCount++;
          }
          currentInsertIndex++;
        }

        // If reached the end of result, extend it
        while (undefinedCount < segmentLength) {
          result.push('None');
          undefinedCount++;
          currentInsertIndex++;
        }

        // Insert the value
        result[currentInsertIndex - 1] = {
          value: pattern[indices[j]],
          row: rowNumber,
        };
      }
    }

    setFinalProductRowList(result);
  };

  const handleStaticMerge = () => {
    const visiblePatterns = Object.entries(patterns)
      .filter(([key, pattern]) => key <= rowCount && pattern.length > 0)
      .map(([key, pattern]) => ({ row: parseInt(key), pattern }));

    const result = [];
    const occupiedColumns = new Set();

    for (let { row, pattern } of visiblePatterns) {
      pattern.forEach((value, index) => {
        if (value !== 'None') {
          if (occupiedColumns.has(index)) {
            alert('Conflict detected! Cannot merge rows statically.');
            return;
          }
          occupiedColumns.add(index);
          result[index] = { value: parseInt(value), row };
        }
      });
    }

    setFinalProductRowList(result.filter((item) => item !== undefined));
  };

  const copyToCSV = () => {
    const csvString = finalProductRowList
      .filter((item) => item !== 'None' && item !== undefined)
      .map((item) => item.value)
      .join(',');
    navigator.clipboard.writeText(csvString).then(() => {
      alert('Final Product Row copied as CSV!');
    });
  };

  const copyToPython = () => {
    const pythonString = `final_product_row = [${finalProductRowList
      .filter((item) => item !== 'None' && item !== undefined)
      .map((item) => item.value)
      .join(', ')}]`;

    navigator.clipboard.writeText(pythonString).then(() => {
      alert('Final Product Row copied as Python list!');
    });
  };

  // Handlers for NumberPattern state changes
  const handleBaseValueChange = (number, newValue) => {
    if (checkAll) {
      // Update baseValue for all visible numbers
      setNumberPatternStates((prevStates) => {
        const newStates = { ...prevStates };
        for (let i = 1; i <= rowCount; i++) {
          newStates[i] = { ...newStates[i], baseValue: newValue };
        }
        return newStates;
      });
    } else {
      // Update baseValue for the specific number
      setNumberPatternStates((prevStates) => ({
        ...prevStates,
        [number]: { ...prevStates[number], baseValue: newValue },
      }));
    }
  };

  const handlePeriodicIntervalChange = (number, newValue) => {
    if (checkAll) {
      setNumberPatternStates((prevStates) => {
        const newStates = { ...prevStates };
        for (let i = 1; i <= rowCount; i++) {
          newStates[i] = { ...newStates[i], periodicInterval: newValue };
        }
        return newStates;
      });
    } else {
      setNumberPatternStates((prevStates) => ({
        ...prevStates,
        [number]: { ...prevStates[number], periodicInterval: newValue },
      }));
    }
  };

  const handlePatternTypeChange = (number, newValue) => {
    if (checkAll) {
      setNumberPatternStates((prevStates) => {
        const newStates = { ...prevStates };
        for (let i = 1; i <= rowCount; i++) {
          newStates[i] = { ...newStates[i], patternType: newValue };
        }
        return newStates;
      });
    } else {
      setNumberPatternStates((prevStates) => ({
        ...prevStates,
        [number]: { ...prevStates[number], patternType: newValue },
      }));
    }
  };

  const handleInstancesChange = (number, newValue) => {
    if (checkAll) {
      setNumberPatternStates((prevStates) => {
        const newStates = { ...prevStates };
        for (let i = 1; i <= rowCount; i++) {
          newStates[i] = { ...newStates[i], instances: newValue };
        }
        return newStates;
      });
    } else {
      setNumberPatternStates((prevStates) => ({
        ...prevStates,
        [number]: { ...prevStates[number], instances: newValue },
      }));
    }
  };

  const handlePatternShiftChange = (number, newValue) => {
    if (checkAll) {
      setNumberPatternStates((prevStates) => {
        const newStates = { ...prevStates };
        for (let i = 1; i <= rowCount; i++) {
          newStates[i] = { ...newStates[i], patternShift: newValue };
        }
        return newStates;
      });
    } else {
      setNumberPatternStates((prevStates) => ({
        ...prevStates,
        [number]: { ...prevStates[number], patternShift: newValue },
      }));
    }
  };

  const handleReset = (number) => {
    if (checkAll) {
      // Reset all visible numbers
      setNumberPatternStates((prevStates) => {
        const newStates = { ...prevStates };
        for (let i = 1; i <= rowCount; i++) {
          newStates[i] = {
            baseValue: 1,
            periodicInterval: 1,
            patternType: 'Linear',
            instances: 10,
            patternShift: 0,
          };
        }
        return newStates;
      });
    } else {
      // Reset specific number
      setNumberPatternStates((prevStates) => ({
        ...prevStates,
        [number]: {
          baseValue: 1,
          periodicInterval: 1,
          patternType: 'Linear',
          instances: 10,
          patternShift: 0,
        },
      }));
    }
  };

  return (
    <div className="p-4 bg-black text-white flex flex-col min-h-screen">
      <div className="flex mb-4">
        <div className="flex flex-col mr-4">
          <input
            type="range"
            min="1"
            max={maxRows}
            value={rowCount}
            onChange={(e) => setRowCount(parseInt(e.target.value))}
            className="h-[80vh] -rotate-180 mr-4 vertical-slider"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={computeFinalProductRow}
          >
            Compute
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={handleStaticMerge}
          >
            Static
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={copyToCSV}
          >
            Copy CSV
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={copyToPython}
          >
            Copy Python
          </button>
          <div className="flex justify-center">
            <label className="font-bold mr-2">Number of rows:</label>
            <input
              type="number"
              min="1"
              max={maxRows}
              value={rowCount}
              onChange={(e) =>
                setRowCount(
                  Math.min(Math.max(parseInt(e.target.value) || 1, 1), maxRows)
                )
              }
              className="border rounded px-2 py-1 bg-gray-800 text-white"
            />
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={isStatic}
              onChange={(e) => setIsStatic(e.target.checked)}
              className="mr-2"
            />
            <label className="text-white">
              Static Mode (Highlight Conflicts)
            </label>
          </div>
          {/* Check All Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={checkAll}
              onChange={(e) => setCheckAll(e.target.checked)}
              className="mr-2"
            />
            <label className="text-white">
              Check All (Apply actions to all rows)
            </label>
          </div>
        </div>
        <div className="flex-grow flex flex-col">
          <div className="flex-grow overflow-x-hidden overflow-y-auto">
            {[...Array(rowCount)].map((_, index) => (
              <NumberPattern
                key={index + 1}
                number={index + 1}
                onPatternChange={handlePatternChange}
                isStatic={isStatic}
                conflictColumns={conflictColumns}
                computeOrder={computeOrder[index + 1]}
                onComputeOrderChange={handleComputeOrderChange}
                // Pass down the state and change handlers
                baseValue={
                  numberPatternStates[index + 1]?.baseValue !== undefined
                    ? numberPatternStates[index + 1].baseValue
                    : 1
                }
                periodicInterval={
                  numberPatternStates[index + 1]?.periodicInterval !== undefined
                    ? numberPatternStates[index + 1].periodicInterval
                    : 1
                }
                patternType={
                  numberPatternStates[index + 1]?.patternType || 'Linear'
                }
                instances={
                  numberPatternStates[index + 1]?.instances !== undefined
                    ? numberPatternStates[index + 1].instances
                    : 10
                }
                patternShift={
                  numberPatternStates[index + 1]?.patternShift !== undefined
                    ? numberPatternStates[index + 1].patternShift
                    : 0
                }
                onBaseValueChange={(newValue) =>
                  handleBaseValueChange(index + 1, newValue)
                }
                onPeriodicIntervalChange={(newValue) =>
                  handlePeriodicIntervalChange(index + 1, newValue)
                }
                onPatternTypeChange={(newValue) =>
                  handlePatternTypeChange(index + 1, newValue)
                }
                onInstancesChange={(newValue) =>
                  handleInstancesChange(index + 1, newValue)
                }
                onPatternShiftChange={(newValue) =>
                  handlePatternShiftChange(index + 1, newValue)
                }
                onReset={() => handleReset(index + 1)}
              />
            ))}
          </div>
        </div>
      </div>
      <div>
        {finalProductRowList.length > 0 && (
          <FinalProductRow finalProductRowList={finalProductRowList} />
        )}
      </div>
      <div className="mt-4">
        {finalProductRowList.length > 0 && (
          <ExpandedFinalProductRow finalProductRowList={finalProductRowList} />
        )}
      </div>
    </div>
  );
};

export default NumberPatternSliders;
