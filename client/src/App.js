import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import i1 from "./assets/images/1.png";

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: #2ABB9B;
  padding: 10px;
  margin: 10px;
  font-weight: bold;
  color: #ffffff;
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledImg = styled.img`
  width: 200px;
  height: 200px;
  @media (min-width: 767px) {
    width: 350px;
    height: 350px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [feedback, setFeedback] = useState("Maybe it's your lucky day.");
  const [claimingNft, setClaimingNft] = useState(false);
  const [mintAmt, setMintAmt] = useState(1);

  const claimNFTs = (_amount) => {
    if (_amount <= 0) {
      return;
    }
    setFeedback("Minting your KryptoTree NFT...");
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mintTo(blockchain.account, _amount)
      .send({
        // gasLimit: "285000",
        to: blockchain.contractAddress,
        from: blockchain.account,
        value: data.cost * _amount
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        setFeedback(
          "WOW, you now own a KryptoTree Nft. go visit Opensea.io to view it."
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen style={{ backgroundColor: "var(--white)" }}>
      <s.Container flex={1} ai={"center"} style={{ padding: 24 }}>
        <s.TextTitle
          style={{ textAlign: "center", fontSize: 28, fontWeight: "bold" }}
        >
          Mint a KryptoTree NFT
        </s.TextTitle>
        <s.SpacerMedium />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }}>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"KryptoTrees Nft"} src={i1} />
            <s.SpacerMedium />
            <s.TextTitle
              style={{ textAlign: "center", fontSize: 35, fontWeight: "bold" }}
            >
              {`${data.availableSupply}/${data.maxSupply}`}
            </s.TextTitle>
          </s.Container>
          <s.SpacerMedium />
          <s.Container
            flex={1}
            jc={"center"}
            ai={"center"}
            style={{ background: "rgba(77, 175, 124, 0.3)", padding: 24 }}
          >
            {Number(data.availableSupply) === 10000 ? (
              <>
                <s.TextTitle style={{ textAlign: "center" }}>
                  The sale has ended.
                </s.TextTitle>
                <s.SpacerSmall />
                <s.TextDescription style={{ textAlign: "center" }}>
                  You can still find KryptoTree NFT on{" "}
                  <a
                    target={"_blank"}
                    href={"https://opensea.io/collection/kryptotrees-nft"}
                  >
                    KryptoTrees NFT on Opensea.io
                  </a>
                </s.TextDescription>
              </>
            ) : (
              <>
                <s.TextTitle style={{ textAlign: "center" }}>
                  { blockchain.web3 && data.cost ? `1 TREE NFT costs ${blockchain.web3.utils.fromWei(data.cost)} MATIC.` : ''}
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription style={{ textAlign: "center" }}>
                { blockchain.web3 && data.cost ? `Max Per Mint is ${data.maxMintAmount}. Excluding gas fee.` : ''}
                </s.TextDescription>
                <s.SpacerSmall />
                <s.TextDescription style={{ textAlign: "center" }}>
                  {feedback}
                </s.TextDescription>
                <s.SpacerMedium />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription style={{ textAlign: "center" }}>
                      Connect to the Polygon network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription style={{ textAlign: "center" }}>
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <><s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <s.TextDescription>Choose mint amount: </s.TextDescription>
                        <StyledButton
                          disabled={claimingNft ? 1 : 0}
                          onClick={() => setMintAmt(prevState => {
                              if(String(prevState) === data.maxMintAmount) {
                                return prevState;
                              } else {
                                return prevState + 1;
                              }
                            }
                          )}
                        >
                          {claimingNft ? "BUSY" : (<span role='img' aria-label='plus'>➕</span>)}
                        </StyledButton>
                        <s.TextDescription> {mintAmt} </s.TextDescription>
                        <StyledButton
                            disabled={claimingNft ? 1 : 0}
                            onClick={() => setMintAmt(prevState => {
                              if(prevState === 1) {
                                return prevState;
                              } else {
                                return prevState - 1;
                              }
                            })}
                          >
                            {claimingNft ? "BUSY" : (<span role='img' aria-label='minus'>➖</span>)}
                          </StyledButton>
                      </s.Container><s.Container ai={"center"} jc={"center"} fd={"row"}>
                          <StyledButton
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              claimNFTs(mintAmt);
                              getData();
                            } }
                          >
                            {claimingNft ? "BUSY" : `MINT`}
                          </StyledButton>
                        </s.Container></>
                )}
              </>
            )}
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerSmall />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription style={{ textAlign: "center", fontSize: 9 }}>
            Please make sure you are connected to the right network (Polygon
            Mainnet) and the correct address. Please note: Once you make the
            purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription style={{ textAlign: "center", fontSize: 9 }}>
           {blockchain.contractAddress ? (`Contract address: ${blockchain.contractAddress}`) : ''}
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
