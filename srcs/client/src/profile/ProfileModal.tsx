import React, { useEffect, useState } from "react"
import {
    Button,
    Box,
    Avatar,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    Text,
    Flex,
    useToast
  } from '@chakra-ui/react'
import * as Constants from '../game/globals/const'
import authService from "../auth/auth.service";
import { LeftBracket, RightBracket } from "../game/game-creation/Brackets";
import PlayerHistoryAccordion from "./PlayerHistoryAccordion";
import { Socket } from "socket.io-client";
import BasicToast from "../toast/BasicToast";

function ProfileModal(props : {userId : string, isOpen : boolean, onOpen : () => void , onClose : () => void, gameSock? : Socket, chatSocket?: Socket}) {

    const [user, setUser] = useState<any>(null);
    const [isYourself, setIsYoursellf] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const toast = useToast();

    function sendDuelInvite(gameType : string) {
        props.gameSock?.emit('gameInvite', {targetId : props.userId, gameType : gameType})
    }
    
    function sendPrivateMessage(){
        props.chatSocket?.emit('DM', {targetId: props.userId})
        props.onClose()
    }

    async function blockThem(targetId: string){
        try{
            const res = await authService.post(process.env.REACT_APP_SERVER_URL + '/users/block', {targetId})
            setIsBlocked(true)
            const id = 'block-toast'
            if (!toast.isActive(id)){
                const status = `${res.data} has been blocked.`
                toast({
                    id,
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text = {status}/>
                    </>)
                    })
            }
        }
        catch(err){
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text = {err.response.data.error}/>
                    </>)
                })
            }
            else
                console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
        props.onClose()
    }
    
    const handleUnblocked = (data : {username: string, username2: string}) => {
        setIsBlocked(false);
        const id = 'unblock-toast'
        if (!toast.isActive(id)){
            const status = `${data.username2} has been unblocked.`
            toast({
                id,
                duration: 5000,
                render : () => ( <>
                    <BasicToast text = {status}/>
                </>)
              })
        }
      };
      
     function unBlockThem(targetId: string){
        props.chatSocket?.emit('unblock', { targetId })
        props.chatSocket?.on('unblocked', (data) => {        
            handleUnblocked(data)
        })
        return () => {
          props.chatSocket?.off('unblocked', handleUnblocked)
        };
      }
      

    useEffect(() => {
        if (!props.userId)
            return ;
        const checkIfYourself = async (userId : string) => {
            try {
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/me');
                if (userId == res?.data?.id)
                {
                    setIsYoursellf(true);
                }
                else
                    setIsYoursellf(false)
            }
            catch(error) {
                console.error('Error checking if profile is my own:', error);
            }
        }
        const fetchUserProfile = async () => {
            try {
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/profile/' + props.userId);
                setUser(res?.data);
                return (res?.data?.id)
            } catch (err) {
                console.error(`${err.response.data.message} (${err.response.data.error})`)
            }
        }
    
        fetchUserProfile().then((userId) => {
            checkIfYourself(userId);
        });
    }, [props.userId])

    useEffect(function socketEvent() {

        props.gameSock?.on('closeModal', () => {
            props.onClose();
        })
        return (() => {
            props.gameSock?.off('closeModal');
        })
    }, [])

    if (!props.userId)
        return ;
    return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered={true}>
        <ModalOverlay
          bg='blackAlpha.300'
          backdropFilter='blur(10px) hue-rotate(90deg)'
        />
        <ModalOverlay />
            <ModalContent borderRadius={'0px'} bg={Constants.BG_COLOR_FADED} textColor={'white'} className="goma"
            paddingTop={'10px'} paddingBottom={'10px'}>
                <Box display={'flex'} flexDir={'row'}
                alignContent={'left'}
                alignItems={'center'}
                justifyContent={'center'}
                width={'448px'}
                marginBottom={'20px'}
                >
                    <LeftBracket w={'16px'} h={'42px'} girth={'6px'} marginRight="-4px"/>
                        <Text fontWeight={'normal'} textAlign={'center'} padding={'0px'} fontSize={'2em'}
                        > 
                        {user?.username} 
                        </Text>
                    <RightBracket w={'16px'} h={'42px'} girth={'6px'} marginLeft="-4px"/>
                </Box>

                <ModalBody display={'flex'} flexDir={'row'} padding={'8px'}>
                    <Box width={'128px'} height={'128px'}>
                        <Avatar
                        size='2xl'
                        name={'avatar'}
                        src={process.env.REACT_APP_SERVER_URL + '/users/avatar/' + props.userId}
                        marginRight={'10px'}
                        >
                        </Avatar>
                    </Box>

                    <Box width={'128px'} 
                    display={'flex'} flexDir={'column'}
                    alignContent={'left'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    >
                        <Text textAlign={'center'} fontSize={'2em'}> WINS </Text>
                        <Text textAlign={'center'} fontSize={'2em'}> {user?.winsAmount} </Text>
                    </Box>
                    <Box width={'128px'} 
                    display={'flex'} flexDir={'column'}
                    alignContent={'left'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    >
                        <Text textAlign={'center'} fontSize={'2em'}> LOOSES </Text>
                        <Text textAlign={'center'} fontSize={'2em'}> {user?.loosesAmount} </Text>
                    </Box>

                </ModalBody>

                <Flex w={'448px'} h={'160px'} wrap={'wrap'} flexDir={'row'}
                alignContent={'center'}
                alignItems={'center'}
                justifyContent={'center'}
                justifyItems={'center'}
                >
                    <Box minW={'224px'} h={'80px'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}>
                        <Button colorScheme='none'
                        fontWeight={'normal'}
                        borderRadius={'none'}
                        _hover={{background : 'white', textColor: 'black'}}
                        isDisabled={isYourself}
                        textAlign={'center'}
                        onClick={() => (sendPrivateMessage())}
                        >
                            Message Them !
                        </Button>
                    </Box>

                    <Box  minW={'224px'} h={'80px'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}>
                        <Button colorScheme='none'
                        fontWeight={'normal'}
                        borderRadius={'none'}
                        _hover={{background : 'white', textColor: 'black'}}
                        onClick={() => (sendDuelInvite(Constants.GAME_TYPE_ONE))}
                        isDisabled={isYourself}
                        textAlign={'center'}
                        >
                            {Constants.GAME_TYPE_ONE} Duel !
                        </Button>
                    </Box>

                    {!isBlocked && <Box w={'224px'} h={'80px'} 
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}>
                        <Button colorScheme='none'
                        fontWeight={'normal'}
                        borderRadius={'none'}
                        _hover={{background : 'white', textColor: 'black'}}
                        onClick={() => (blockThem(props.userId))}
                        isDisabled={isYourself}
                        >
                             Block them !
                        </Button>
                    </Box>}

                    {isBlocked && <Box w={'224px'} h={'80px'} 
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}>
                        <Button colorScheme='none'
                        fontWeight={'normal'}
                        borderRadius={'none'}
                        _hover={{background : 'white', textColor: 'black'}}
                        onClick={() => (unBlockThem(props.userId))}
                        isDisabled={isYourself}
                        >
                             unblock them !
                        </Button>
                    </Box>}

                    <Box w={'224px'} h={'80px'} 
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}>
                        <Button colorScheme='none'
                        fontWeight={'normal'}
                        borderRadius={'none'}
                        _hover={{background : 'white', textColor: 'black'}}
                        onClick={() => (sendDuelInvite(Constants.GAME_TYPE_TWO))}
                        isDisabled={isYourself}
                        >
                            {Constants.GAME_TYPE_TWO} Duel !
                        </Button>
                    </Box>
                </Flex>
                <PlayerHistoryAccordion userId={user?.id}/>

            </ModalContent>
    </Modal>);
}

export default ProfileModal