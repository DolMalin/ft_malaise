import React, { useEffect, useState } from "react";
import { Room } from "./interface";
import authService from "../auth/auth.service";
import { Socket } from "socket.io-client";
import BasicToast from "../toast/BasicToast";
import { Flex, UnorderedList, useToast } from "@chakra-ui/react";
import UserInUsersList from "./UserInUsersList";

function ChannelUsersList(props : {room : Room, chatSocket : Socket, gameSocket : Socket}) {

    const [isOp, setIsOp] = useState(false)
    const toast = useToast();
    const toastId = 'toast';
    const [rerender, setRerender] = useState(false)
    const [userList, setUserList] = useState
    <{
        id: string, 
        username: string
    }[]>([]);
    const [me, setMe] = useState<
    {
        id: string, 
        username: string
    } | undefined>(undefined);
    const [banList, setBanList] = useState
    <{
        id: string, 
        username: string
    }[]>([]);

    async function getUserList(roomId: number, me : {username: string, id: string}){
        let userlist : {
            id : string,
            username: string
        }[]
        try{
            const users =  await authService.get(process.env.REACT_APP_SERVER_URL + '/room/userlist/' + roomId)
            userlist = users.data
            userlist = userlist.filter(user => user.id !== me?.id)
        }
        catch(err){
            console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
        return (userlist);
    }
 
    const fetchUserList = async (me : {username: string, id: string}) => {
        try {
            const array = await getUserList(props.room.id, me)
            setUserList(array)
        }
        catch(err){
            console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    const fetchBanList = async (roomId : number) => {
        try {
          const bannedUsersArray = await authService.get(process.env.REACT_APP_SERVER_URL + '/room/bannedList/' + roomId)
          setBanList(bannedUsersArray.data);
        }
        catch(err) {
          console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    useEffect(() => {
        
        async function asyncWrapper() {
            try{
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/me')
                setMe(res.data)
                fetchUserList(res.data)
                fetchBanList(props.room?.id);

                const privi = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/userPrivileges',
                {targetId : res.data.id, roomName : props.room.name})
                if (privi.data === 'isAdmin' || privi.data === 'isOwner')
                  setIsOp(true);
                else
                  setIsOp(false);
            }
            catch(err){
                console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)}
        }

        asyncWrapper();
    }, [rerender])

    useEffect(function sockEvents() {

        function forceRender() {
          if (rerender === true)
            setRerender(false)
          else if (rerender === false)
            setRerender(true);
        };
        props.chatSocket?.on('channelUpdate', forceRender);
  
        props.chatSocket?.on('userJoined', forceRender);
  
        props.chatSocket?.on('youGotBanned', () => {
  
          const id = 'test-toast';
          if(!toast.isActive(id)) {
            toast({
              id,
              isClosable: true,
              duration : 5000,
              render : () => ( <> 
                <BasicToast text={'you got banned from ' + props.room.name}/>
            </>)
            })
          }
        
        });
  
        return (() => {
          props.chatSocket?.off('channelUpdate');
          props.chatSocket?.off('userJoined');
        })
      }, [rerender])

    return (<>
        <Flex 
        width={'100%'}
        height={'100%'}
        flexDir={'row'}
        justifyContent={'space-evenly'}
        >
            {userList.map((user, index) => {

                return (
                <UnorderedList key={index}>
                    <UserInUsersList 
                    username={user.username}
                    userId={user.id} 
                    room={props.room} 
                    userIsOp={isOp} 
                    chatSock={props.chatSocket}
                    gameSock={props.gameSocket}/>
                </UnorderedList>)
            })}
        </Flex>
    </>);
};

export default ChannelUsersList