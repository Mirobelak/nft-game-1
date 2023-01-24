import React, { useEffect, useState } from 'react';
import './App.css';
import banner from './assets/banner.png';
import SelectCharacter from './Components/SelectCharacter/SelectCharacter';
import LoadingIndicator from './Components/LoadingIndicator';
import Arena from './Components/Arena/Arena';
import { transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const CONTRACT_ADDRESS = "0x41F96163fCCdDF8df0bAa5c1df4f7964c1291e47"

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src={banner}
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    }
    else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} currentAccount={currentAccount} setCharacterNFT={setCharacterNFT} />;
    }
  };

  const checkNetwork = async () => {
    try { 
      if (window.ethereum.networkVersion !== '80001') {
        alert("Please connect to Mumbai!")
      }
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(CONTRACT_ADDRESS,myEpicGame, signer)
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      console.log(gameContract)
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
        setIsLoading(false);
      } else {
        console.log('No character NFT found');
      }
    };

    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className='header gradient-text text-red-400'>⚔️ NFT CARD GAME ⚔️</p>
          <p>Collect and battle your NFTs!</p>
          <a href="https://mumbaifaucet.com/" target="_blank" style={{color:"yellow", textDecoration:"none", cursor: "pointer"}}>You need to have test MATIC to play a GAME. Here you can get sit for FREE</a>
          <p className="sub-text">Pick your Hero and attack EPIC BOSS!</p>
          <div className="connect-wallet-container">
          {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

