import { Socket } from "socket.io";

export interface Paddle {
    x : number,
    y : number,
    movingLeft : boolean,
    movingRight : boolean,
    speed : number,
    width : number,
    height : number,
    hitCount : number
  }
  
  export interface Ball {
    x : number,
    y : number,
    size : number,
    color : string,
    angle : number,
    speed : number
  }
  
  export interface GameState {
    clientOne : Socket,
    clientTwo : Socket,
    gameIsFull : boolean,
    isPaused : boolean,
    clientOneScore : number,
    clientTwoScore : number,
    Victor : string,
    gameType  : string,
    paddleOne : Paddle,
    paddleTwo : Paddle,
    ball : Ball,
    ballRefreshInterval : string | number | NodeJS.Timeout
  }
  
  export interface GameInfo {
    gameType : string,
    playerId : string,
    roomName : string
  }

  export interface GameMetrics {
    paddleOne : Paddle,
    paddleTwo : Paddle,
    ball : Ball,
  }

  export interface leaderboardStats {

    username: string
    winsAmount: number
    loosesAmount: number
    WLRatio : number
  }