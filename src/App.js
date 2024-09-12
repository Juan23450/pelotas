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

  useEffect(() => {
    onPatternChange(number, pattern);
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
        </div>

        <div
          className="h-10 relative overflow-hidden whitespace-nowrap border-b border-white"
          style={{ backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }}
        >
          {pattern.map((item, index) => (
            <React.Fragment key={index}>
              {isStatic && conflictColumns.includes(item.position) && (
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `${item.position * 10}px`,
                    width: '10px',
                    backgroundColor: 'rgba(0, 255, 0, 0.4)',
                    boxShadow: '0 0 10px 5px rgba(0, 255, 0, 0.6)',
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
        style={{ backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }}
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
        ))}
      </div>
    </div>
  );
};

const NumberPatternSliders = () => {
  const [rowCount, setRowCount] = useState(10);
  const [patterns, setPatterns] = useState({});
  const [isStatic, setIsStatic] = useState(false);
  const [conflictColumns, setConflictColumns] = useState([]);
  const [finalProductRowList, setFinalProductRowList] = useState([]);
  const [computedProductRowList, setComputedProductRowList] = useState([]);
  const maxRows = 50;

  const handlePatternChange = (number, pattern) => {
    setPatterns((prev) => ({ ...prev, [number]: pattern }));
  };

  useEffect(() => {
    if (isStatic) {
      const visiblePatterns = Object.entries(patterns)
        .filter(([key, pattern]) => key <= rowCount && pattern.length > 0)
        .map(([_, pattern]) => pattern);
      const allPositions = visiblePatterns.flatMap((pattern) =>
        pattern.filter((item) => item.value !== undefined).map((item) => item.position)
      );
      const positionCounts = allPositions.reduce(
        (acc, pos) => ({ ...acc, [pos]: (acc[pos] || 0) + 1 }),
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
      .filter(([key, pattern]) => key <= rowCount && pattern.length > 0)
      .map(([key, pattern]) => ({ row: parseInt(key), pattern }));
  
    let result = Array(100).fill('None');
    
    if (visiblePatterns.length > 0) {
      visiblePatterns[0].pattern.forEach(instance => {
        if (instance.position < result.length) {
          result[instance.position] = { value: instance.value, row: visiblePatterns[0].row };
        }
      });
    }
  
    for (let rowIndex = 1; rowIndex < visiblePatterns.length; rowIndex++) {
      const { row, pattern } = visiblePatterns[rowIndex];
      let currentInsertIndex = 0;
  
      pattern.forEach(instance => {
        let segmentLength = instance.position + 1;
        const previousInstance = pattern.find(inst => inst.position < instance.position);
        if (previousInstance) {
          segmentLength = instance.position - previousInstance.position;
        }
  
        let noneCount = 0;
        while (noneCount < segmentLength && currentInsertIndex < result.length) {
          if (result[currentInsertIndex] === 'None') {
            noneCount++;
          }
          currentInsertIndex++;
        }
  
        if (currentInsertIndex <= result.length) {
          result[currentInsertIndex - 1] = { value: instance.value, row };
        }
      });
    }
  
    setComputedProductRowList(result);
  };

  const handleStaticMerge = () => {
    const visiblePatterns = Object.entries(patterns)
      .filter(([key, pattern]) => key <= rowCount && pattern.length > 0)
      .map(([key, pattern]) => ({ row: parseInt(key), pattern }));
  
    const result = Array(100).fill('None');
    const occupiedColumns = new Set();

    for (let rowIndex = 0; rowIndex < visiblePatterns.length; rowIndex++) {
      const { row, pattern } = visiblePatterns[rowIndex];
      
      for (const instance of pattern) {
        if (instance.value !== undefined) {
          if (occupiedColumns.has(instance.position)) {
            alert("Conflict detected! Cannot merge rows statically.");
            return;
          }
          occupiedColumns.add(instance.position);
          result[instance.position] = { value: instance.value, row };
        }
      }
    }

    setComputedProductRowList(result);
  };

  const copyToCSV = () => {
    const csvString = computedProductRowList
      .map(item => (item !== 'None' ? item.value : ''))
      .join(',');

    navigator.clipboard.writeText(csvString).then(() => {
      alert("Final Product Row copied as CSV!");
    });
  };

  const copyToPython = () => {
    const pythonString = `final_product_row = [${computedProductRowList
      .map(item => (item !== 'None' ? item.value : 'None'))
      .join(', ')}]`;

    navigator.clipboard.writeText(pythonString).then(() => {
      alert("Final Product Row copied as Python list!");
    });
  };

  return (
    <div className="p-4 bg-black text-white flex h-screen">
      <div className="flex flex-col">
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
              setRowCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), maxRows))
            }
            className="border rounded px-2 py-1 bg-gray-800 text-white"
          />
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        {computedProductRowList.length > 0 && (
          <FinalProductRow finalProductRowList={computedProductRowList} />
        )}

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
  );
};

export default NumberPatternSliders;
