import React, { useState, useEffect } from 'react';

const API_KEY = 'YOUR_API_KEY_HERE';
const API_BASE_URL = `https://www.alphavantage.co/query?apikey=${ API_KEY }`;
const DEFAULT_INPUT = 'MSFT';

function App ()
{
  const [ data, setData ] = useState( {} );
  const [ input, setInput ] = useState( DEFAULT_INPUT );
  const [ error, setError ] = useState( null );

  useEffect( () =>
  {
    const fetchData = async () =>
    {
      try
      {
        const response = await fetch( `${ API_BASE_URL }&function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ input }` );
        if ( !response.ok )
        {
          throw new Error( `HTTP error! status: ${ response.status }` );
        }
        const json = await response.json();
        setData( json );
        setError( null );
      } catch ( error )
      {
        setData( {} );
        setError( error.message );
      }
    };
    fetchData();
  }, [ input ] );

  const handleInputChange = e =>
  {
    setInput( e.target.value );
  };

  return (
    <div>
      <h1>Stock Viewer</h1>
      <div>
        <h2>Select Stock:</h2>
        <button onClick={() => setInput( 'MSFT' )}>Microsoft</button>
        <button onClick={() => setInput( 'AAPL' )}>Apple</button>
        <button onClick={() => setInput( 'AMZN' )}>Amazon</button>
        <div>
          <label htmlFor="text-input">Enter Symbol:</label>
          <input type="text" id="text-input" value={input} onChange={handleInputChange} />
        </div>
      </div>
      <div>
        <h2>Results:</h2>
        {error && <div>{error}</div>}
        {data[ 'Time Series (Daily)' ] && (
          <ul>
            {Object.entries( data[ 'Time Series (Daily)' ] ).map( ( [ date, datum ] ) => (
              <li key={date}>
                {date} - {datum[ '4. close' ]}
              </li>
            ) )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
