import React, { useEffect, useState } from "react";
import { Box,
Button,
Flex,
Divider,
 } from "@chakra-ui/react"
import * as Constants from '../globals/const'
import { LeftBracket, RightBracket } from "./Brackets";
import authService from "../../auth/auth.service";
import { Socket } from "socket.io-client";

function GameMode(props : {dispatch : Function, sock : Socket}) {

    const [playerAvailable, setPlayerAvalaible] = useState(false);

    useEffect(() => {async function checkPlayerAvailability() {

        try {
            const res = await authService.get('http://127.0.0.1:4545/users/isAvailable');
            setPlayerAvalaible(res.data);
        }
        catch (e) {
            console.log('IsAvalaible returned : ', e)
        }
    }
    checkPlayerAvailability();
    }, [])

    useEffect(() => {

        props.sock.on('isAvailable', ({bool}) => {

            console.log('setting player availability')
            setPlayerAvalaible(bool);
        })
        return (() => {
            props.sock.off('isAvailable');
        })
    }, []);

    return (<>
        <Flex flexDir={'column'} wrap={'nowrap'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Box h={'lg'} w={'lg'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            >
                <Box width={'sm'} height={'sm'}
                display={'flex'} flexDir={'row'} 
                alignItems={'center'} justifyContent={'center'}
                >
                    <LeftBracket w={'30px'} h={'150px'} girth={'10px'}/>

                    <Button
                    fontSize={'2xl'}
                    textColor={'white'}
                    bgColor={Constants.BG_COLOR}
                    fontWeight={'normal'}
                    h={'100px'}
                    borderRadius={'0px'}
                    _hover={{background : 'white', textColor: 'black'}}
                    isDisabled={playerAvailable ? false : true}
                    onClick={() => {
                        props.dispatch({type : 'SET_GAME_TYPE', payload : Constants.GAME_TYPE_ONE}); 
                        props.dispatch({type : 'SET_LF_GAME', payload : true});
                        try {
                            authService.patch('http://127.0.0.1:4545/users/updateIsAvailable', {isAvailable : false})
                            props.sock.emit('availabilityChange', false);
                        }
                        catch (e) {
                            console.log('setting is Available to false returned : ', e.message);
                        }
                    }}> 
                        {Constants.GAME_TYPE_ONE} 
                    </Button>

                    <RightBracket w={'30px'} h={'150px'} girth={'10px'}/>
                </Box>
            </Box>
            
            <Flex flexDir={'row'} width={'100%'}
                alignItems={'center'}
                justifyContent={'center'}
            >
                <Divider variant={'dashed'} w={'35%'}/>
                <Button w='20%' margin='5%'
                borderRadius={'0'}
                bg={Constants.BG_COLOR} 
                textColor={'white'} 
                fontWeight={'normal'}
                _hover={{background : 'white', textColor: 'black'}}
                onClick={() => {
                    props.dispatch({type : 'SET_GAME_MOD', payload : false});
                    props.dispatch({type : 'SET_PLAY', payload : true});
                }}> Go back !</Button>
                <Divider variant={'dashed'} w={'35%'}/>
            </Flex>

            <Box h={'lg'} w={'lg'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            >
                <Box width={'sm'} height={'sm'}
                display={'flex'} flexDir={'row'} 
                alignItems={'center'} justifyContent={'center'}
                >
                    <LeftBracket w={'30px'} h={'150px'} girth={'10px'}/>

                    <Button
                    fontSize={'2xl'}
                    fontWeight={'normal'}
                    textColor={'white'}
                    bgColor={Constants.BG_COLOR}
                    h={'100px'}
                    borderRadius={'0px'}
                    _hover={{background : 'white', textColor: 'black'}}
                    isDisabled={playerAvailable ? false : true}
                    onClick={() => {
                        props.dispatch({type : 'SET_GAME_TYPE', payload : Constants.GAME_TYPE_TWO}); 
                        props.dispatch({type : 'SET_LF_GAME', payload : true})
                        try {
                            authService.patch('http://127.0.0.1:4545/users/updateIsAvailable', {isAvailable : false})
                            props.sock.emit('availabilityChange', false);
                        }
                        catch (e) {
                            console.log('setting is Available to false returned : ', e);
                        }
                    }}
                    >
                        {Constants.GAME_TYPE_TWO}
                    </Button>

                    <RightBracket w={'30px'} h={'150px'} girth={'10px'}/>
                </Box>
            </Box>
        </Flex>
    </>)
}

export default GameMode