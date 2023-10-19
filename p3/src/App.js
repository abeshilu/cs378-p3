import React, { useState, useEffect } from 'react';
import './App.css';
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";


function App ()
{
  const [ symbol, setSymbol ] = useState( 'SPY' );
  const [ results, setResults ] = useState( [] );
  const [ error, setError ] = useState( '' );
  const [ symbols, setSymbols ] = useState( [] );
  const [ savedSymbols, setSavedSymbols ] = useState( [ 'GOOGL', 'SPY', 'AAPL', 'TSLA' ] );
  const [ user, setUser ] = useState( null );

  const firebaseConfig = {
    apiKey: "AIzaSyAINycS4U_qtwiNm1STVoD-WHkYj5aY7b4",
    authDomain: "cs378-p4-a1a24.firebaseapp.com",
    databaseURL: "https://cs378-p4-a1a24-default-rtdb.firebaseio.com",
    projectId: "cs378-p4-a1a24",
    storageBucket: "cs378-p4-a1a24.appspot.com",
    messagingSenderId: "1059173415739",
    appId: "1:1059173415739:web:81aa4e8fb5aac7d82b951e",
    measurementId: "G-35RQNYTHD2"
  };

  firebase.initializeApp( firebaseConfig );

  const auth = firebase.auth();
  const database = firebase.database();

  const users = [
    { email: 'user1@example.com', password: 'password1' },
    { email: 'user2@example.com', password: 'password2' },
    { email: 'user3@example.com', password: 'password3' }
  ];

  users.forEach( user =>
  {
    firebase.auth().createUserWithEmailAndPassword( user.email, user.password )
      .then( ( userCredential ) =>
      {
        // User created successfully
        const { uid } = userCredential.user;
        firebase.database().ref( `users/${ uid }` ).set( {
          email: user.email,
          password: user.password
        } );
      } )
      .catch( ( error ) =>
      {
        console.error( error );
      } );
  } );


  const handleSignIn = async ( event ) =>
  {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    try
    {
      const userCredential = await auth.signInWithEmailAndPassword( email, password );
      setUser( userCredential.user );

      // Retrieve application state for this user
      const userRef = database.ref( `users/${ userCredential.user.uid }` );
      userRef.on( "value", ( snapshot ) =>
      {
        const data = snapshot.val();
        setSavedSymbols( data?.savedSymbols || [ 'GOOGL', 'SPY', 'AAPL', 'TSLA' ] );
      } );

    } catch ( error )
    {
      console.error( error );
      setError( "Invalid username or password" );
    }
  };

  const handleSignOut = () =>
  {
    const userRef = database.ref( `users/${ user?.uid }` );
    userRef.set( { savedSymbols } );

    auth.signOut();
    setUser( null );
    setSavedSymbols( [ 'GOOGL', 'SPY', 'AAPL', 'TSLA' ] );
  };

  useEffect( () =>
  {
    const unsubscribe = auth.onAuthStateChanged( ( user ) =>
    {
      if ( user )
      {
        setUser( user );
      } else
      {
        setUser( null );
      }
    } );

    return () => unsubscribe();
  }, [] );

  const handleSaveSymbol = async ( event ) =>
  {
    event.preventDefault();
    if ( !savedSymbols.includes( symbol ) )
    {
      setSavedSymbols( [ ...savedSymbols, symbol ] );
    }
    const userRef = database.ref( `users/${ user?.uid }` );
    userRef.update( { savedSymbols: [ ...savedSymbols, symbol ] } );
  };

  useEffect( () =>
  {
    const fetchSymbols = async () =>
    {
      try
      {
        const response = await fetch(
          `https://datahub.io/core/s-and-p-500-companies/r/constituents.json`
        );
        const data = await response.json();
        const symbols = data.map( ( company ) => company.Symbol );
        setSymbols( symbols );
        handleSubmit( { preventDefault: () => { } } );
      } catch ( error )
      {
        console.error( error );
      }
    };
    fetchSymbols();
  }, [] );

  const handleSubmit = async ( event ) =>
  {
    event.preventDefault();

    if ( !symbols.includes( symbol ) && !( symbol === "SPY" ) )
    {
      setError( `Invalid stock symbol ${ symbol }` );
      setResults( [] );
      return;
    }

    try
    {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ symbol }&apikey=YOUR_API_KEY`
      );
      const data = await response.json();

      if ( data[ 'Global Quote' ] )
      {
        setResults( Object.entries( data[ 'Global Quote' ] ) );
        setError( '' );
      } else
      {
        setError( `Max searches allowed at this time!` );
        setResults( [] );
      }
    } catch ( error )
    {
      console.error( error );
      setError( `An error occurred while fetching data for ${ symbol }` );
      setResults( [] );
    }
  };

  const handleChange = ( event ) =>
  {
    setSymbol( event.target.value );
  };

  const handleButtonClick = async ( event ) =>
  {
    const buttonSymbol = event.target.value;
    setSymbol( buttonSymbol );

    try
    {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ buttonSymbol }&apikey=YOUR_API_KEY`
      );
      const data = await response.json();

      if ( data[ 'Global Quote' ] )
      {
        setResults( Object.entries( data[ 'Global Quote' ] ) );
        setError( '' );
      } else
      {
        setError( `Max searches allowed at this time!` );
        setResults( [] );
      }
    } catch ( error )
    {
      console.error( error );
      setError( `An error occurred while fetching data for ${ buttonSymbol }` );
      setResults( [] );
    }
  };

  const handleSaveButtonClick = () =>
  {
    if ( !symbols.includes( symbol ) && !( symbol === "SPY" ) )
    {
      setError( `Invalid stock symbol ${ symbol }` );
      setResults( [] );
      return;
    }
    if ( !savedSymbols.includes( symbol ) )
    {
      setSavedSymbols( [ ...savedSymbols, symbol ] );
    }
  }


  return (
    <div>
      {user ? (
        <div class="centered">
          <p>Welcome, {user.email}!</p>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      ) : (
        <form onSubmit={handleSignIn}>
          <label>
            Email:
            <input type="email" name="email" required />
          </label>
          <label>
            Password:
            <input type="password" name="password" required />
          </label>
          <button type="submit">Sign in</button>
        </form>
      )}
      <h1>Stock Info Interface</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter a Stock Symbol in the S&P 500:
        </label>
        <input type="text" value={symbol} onChange={handleChange} />
        <button type="submit">Search</button>
        <button type="button" onClick={handleSaveSymbol || handleSaveButtonClick}>+</button>
      </form>
      <p>Click a button to automatically search for a stock symbol:</p>

      {savedSymbols.length > 0 && (
        <div class="centered">
          {savedSymbols.map( ( symbol ) => (
            <button key={symbol} onClick={() => handleButtonClick( { target: { value: symbol } } )}>
              {symbol}
            </button>
          ) )}
        </div>
      )}
      {results.length === 0 && !error && (
        <p>Enter a stock symbol in the S&P 500 to get started</p>
      )}
      {error && <p>{error}</p>}
      {results.length > 0 && (
        <div class="divTable">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {results.map( ( [ key, value ] ) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ) )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default App;