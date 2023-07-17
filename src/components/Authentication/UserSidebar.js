import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import { CryptoState } from "../../CryptoContext";
import { Avatar } from "@material-ui/core";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { numberWithCommas } from "../CoinsTable";
import { AiFillDelete } from "react-icons/ai";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
  container: {
    width: 350,
    padding: 25,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "monospace",
  },
  profile:{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    height: "92%"
  }, 
  picture: {
    width: 100,
    height: 100,
    cursor:'pointer',
    backgroundColor: "gold",
    objectFit: "contain"
  },
  logout:{
    height:"8%",
    width:"100%",
    backgroundColor:"gold",
    marginTop: 20
  },
  watchlist :{
    flex:1,
    width : "100%",
    backgroundColor: "#3233098c",
    borderRadius: 10,
    padding: 15,
    paddingTop: 10,
    display: "flex",
    flexDirection: "column",
    alignItems:"center",
    gap: 12,
    overflowY: "scroll"
  },
  coin:{
    padding: 10,
    borderRadius : 5,
    color: "black",
    width :"100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "gold",
    boxShadow: "0 0 3px black"
  },
});

export default function UserSidebar() {
  const classes = useStyles();
  const [state, setState] = useState({
    right: false,
  });
  const { user, setAlert, watchlist ,coins , symbol} = CryptoState();
  const history = useHistory();

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const logout = ()=>{
    signOut(auth);
    setAlert({
      open: true,
      type: "success",
      message: "Logout Successfull !"
    })
    toggleDrawer();
  }
  // const handleClickOnWatchlistItem = (coin)=>{
  //    history.push(`/coins/${coin.id}`)
  // }

  const removeFromWatchlist = async(coin)=>{
    const coinRef = doc(db, "watchlist", user.uid);
    try{
      await setDoc(coinRef, {coins: watchlist.filter((watchItem)=> watchItem !== coin?.id)},
      {merge: true});
      setAlert({
        open: true,
        message: `${coin.name} Removed from the Watchlist`,
        type: "success"
      })
    } catch(err){
      setAlert({
        open: true,
        message: err.message,
        type: "error"
      })
    }
  }
  return (
    <div>
      {["right"].map((anchor) => (
        <React.Fragment key={anchor}>
          <Avatar
            onClick={toggleDrawer(anchor, true)}
            style={{
              height: 38,
              width: 38,
              marginLeft: 15,
              cursor: "pointer",
              backgroundColor: "gold",
            }}
            src={user.photoURL}
            alt={user.displayName || user.email}
          />
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            <div className={classes.container}>
              <div className={classes.profile}>
                <Avatar
                  className={classes.picture}
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                />
                <span 
                style={{
                  width: "100%",
                  fontSize: 25,
                  textAlign: "center",
                  fontWeight: "bolder",
                  wordWrap: "break-word"
                }}>
                {user.displayName || user.email}
                </span>
                <div className={classes.watchlist}>
                  <span style={{fontSize:20, fontWeight:"bold", textShadow: "0 0 5px black"}}>Watchlist</span>
                   {coins.map((coin)=>{
                    if(watchlist.includes(coin.id)){
                      return(
                        <div key={coin.id} className={classes.coin} onClick={()=>history.push(`/coins/${coin.id}`)}
                        >
                          <span>{coin.name}</span>
                          <span style={{display: "flex", gap: 8}}>
                            {symbol}
                            {numberWithCommas(coin.current_price.toFixed(2))}
                            {<AiFillDelete 
                               style={{cursor: "pointer"}}
                               fontSize={16}
                               onClick={()=> removeFromWatchlist(coin)}
                            />}
                          </span>
                        </div>
                      )
                    }
                   })}
                </div>
              </div>
              <Button
              variant="contained"
              className={classes.logout}
              onClick={logout}
              >Log Out</Button>
            </div>
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}
