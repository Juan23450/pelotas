import React, { useState, useEffect } from 'react';

const NumberPattern = ({ number, onPatternChange, isStatic, conflictColumns }) => {
  const [baseValue, setBaseValue] = useState(0);
  const [periodicInterval, setPeriodicInterval] = useState(1);
  const [instances, setInstances] = useState(10);
  const [patternShift, setPatternShift] = useState(0);

  const generatePattern = () => {
    let pattern = [];
    let currentPos = patternShift;
    for (let n = 0; n < instances; n++) {
      const space = (baseValue + n) * periodicInterval;
      currentPos += space;
      pattern.push({ value: number, instance: n, position: currentPos });
      for (let i = 1; i < periodicInterval; i++) {
        pattern.push({ value: undefined, instance: -1, position: currentPos + i });
      }
      currentPos += periodicInterval;
    }
    return pattern;
  };

  const pattern = generatePattern();

  const generatePythonList = () => {
    const maxLength = 1000; // Adjust as needed
    const pythonList = Array(maxLength).fill('None');
    pattern.forEach(item => {
      if (item.value !== undefined && item.position < maxLength) {
        pythonList[item.position] = number;
      }
    });
    return pythonList;
  };

  const pythonList = generatePythonList();

  useEffect(() => {
    onPatternChange(number, pythonList);
  }, [baseValue, periodicInterval, instances, patternShift, number, onPatternChange]);

  const handleDrag = (e, index) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue = index === 0 ? baseValue : patternShift;
    const handleMove = (e) => {
      const diff = Math.round((e.clientX - startX) / 10);
      if (index === 0) setBaseValue(startValue + diff);
      else setPatternShift(startValue + diff);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', handleMove), { once: true });
  };

  // Calculate segment lengths
  const calculateSegmentLengths = () => {
    const indices = pattern
      .filter(item => item.value !== undefined)
      .map(item => item.position);
    return indices.map((pos, idx) => {
      if (idx === 0) return pos + 1;
      return pos - indices[idx - 1];
    });
  };

  return (
    <div className="mb-4 flex items-center">
      <div className="flex-grow">
        <div className="flex items-center flex-wrap text-white mb-2">
          <span className="w-8 font-bold mr-2">{number}:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={instances}
            onChange={(e) => setInstances(parseInt(e.target.value))}
            className="w-32 h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer mr-2"
          />
          <input
            type="range"
            min="1"
            max="5"
            value={periodicInterval}
            onChange={(e) => setPeriodicInterval(parseInt(e.target.value))}
            className="w-32 h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer mr-2"
          />
          <span className="text-sm w-24">Base Value: {baseValue}</span>
          <button
            onClick={() => {
              setBaseValue(0);
              setPeriodicInterval(1);
              setPatternShift(0);
              setInstances(10);
            }}
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
              {item.value !== undefined && (
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
        {finalProductRowList.map((item, index) => (
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
        ))}
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
            .map((item) =>
              item === 'None' ? 'None' : `${item.value}`
            )
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
              backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)',
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
                .map((item, index) =>
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
  const maxRows = 50;

  const handlePatternChange = (number, pythonList) => {
    setPatterns((prev) => ({ ...prev, [number]: pythonList }));
  };

  useEffect(() => {
    if (isStatic) {
      const visiblePatterns = Object.entries(patterns)
        .filter(([key]) => key <= rowCount)
        .map(([_, pattern]) => pattern);
      const allPositions = visiblePatterns.flatMap((pattern) =>
        pattern.map((value, index) => (value !== 'None' ? index : -1))
      );
      const positionCounts = allPositions.reduce(
        (acc, pos) => {
          if (pos !== -1) {
            acc[pos] = (acc[pos] || 0) + 1;
          }
          return acc;
        },
        {}
      );
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

    let result = [...visiblePatterns[0].pattern];
    result = result.map((value) =>
      value !== 'None' ? { value: parseInt(value), row: visiblePatterns[0].row } : 'None'
    );

    for (let i = 1; i < visiblePatterns.length; i++) {
      const { row, pattern } = visiblePatterns[i];

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
        while (undefinedCount < segmentLength && currentInsertIndex < result.length) {
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
        result[currentInsertIndex - 1] = { value: pattern[indices[j]], row };
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
      .map((item) => (item !== 'None' ? item.value : ''))
      .join(',');
    navigator.clipboard.writeText(csvString).then(() => {
      alert('Final Product Row copied as CSV!');
    });
  };

  const copyToPython = () => {
    const pythonString = `final_product_row = [${finalProductRowList
      .map((item) => (item === 'None' ? 'None' : `${item.value}`))
      .join(', ')}]`;

    navigator.clipboard.writeText(pythonString).then(() => {
      alert('Final Product Row copied as Python list!');
    });
  };

  return (
    <div className="p-4 bg-black text-white flex flex-col h-screen">
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
            <label className="text-white">Static Mode (Highlight Conflicts)</label>
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

