import React, { useEffect, useState } from 'react';
import {
    Button,
    Text, 
    Box,
    Kbd,
    Flex,
    Heading
} from '@chakra-ui/react';
import * as Constants from '../const';
import '../../fonts.css'

function PlayBox(props : {dispatch : Function}) {

    type FlexDirection = "column" | "inherit" | "-moz-initial" | "initial" | "revert" | "unset" | "column-reverse" | "row" | "row-reverse" | undefined;
    
    const [flexDisplay, setFlexDisplay] = useState<FlexDirection>(window.innerWidth > 1200 ? 'row' : 'column');

    useEffect(() => {
        
        function handleResize() {
            if (window.innerWidth < 1200)
                setFlexDisplay('column');
            else if (window.innerWidth >= 1200)
                setFlexDisplay('row');
        }
        window.addEventListener('resize', handleResize)

        return (() => {
            window.removeEventListener('resize', handleResize);
        })
    },  [flexDisplay])

    return (
    <Flex flexDir={flexDisplay} wrap={'wrap'} overflow={'hidden'}>

        <Box
        width={'sm'} 
        height={'sm'} 
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        padding={'10px'}
        _hover={{textColor: 'white'}}
        >
            <Flex w={'95%'} h={'100%'}
            flexDirection={'column'}
            alignItems={'center'}>
                <Text w={'95%'} h={'30%'} as='h1' className='bionic'> Standard Mod </Text>

                <Text>
                    your average pong, except its vertically orientend. Angle redirection will also tend to make it
                    more important to hit the ball with the extremities of your paddle
                </Text>
            </Flex>
        </Box>

        <Box  width={'sm'} 
        height={'sm'} 
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        padding={'10px'}
        textColor={'white'}
        >
            <Flex direction="column" height="100%" width='100%'>
                <Box h="50%" w="100%"
                    display={'flex'}
                    flexDirection={'row'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    >
                    <Button fontWeight={'normal'} onClick={() => {
                        props.dispatch({type : 'SET_PLAY', payload : false});
                        props.dispatch({type : 'SET_GAME_MOD', payload : true});
                    }} _hover={{transform: 'scale(1.5)'}} className='bionic'> 
                    Play</Button>
                </Box>

                <Flex h="50%" w="100%">
                    <Box h="100%" w="50%"
                        display={'flex'}
                        flexDirection={'column'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        textAlign={'center'}
                        >
                        <Kbd textColor={'black'}> A </Kbd>  
                        <Text letterSpacing={'2px'}> Will make your paddle go <b>Left</b> </Text>
                    </Box>

                    <Box h="100%" w="50%"
                        display={'flex'}
                        flexDirection={'column'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        textAlign={'center'}
                        >
                        <Kbd textColor={'black'}> D </Kbd>  
                        <Text letterSpacing={'2px'}> Will make your paddle go <b>Right</b> </Text>
                    </Box>
                </Flex>
            </Flex>
        </Box>

        <Box
        width={'sm'} 
        height={'sm'} 
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        padding={'10px'}
        _hover={{textColor: 'white'}}
        >
            <Flex w={'95%'} h={'100%'}
            flexDirection={'column'}
            alignItems={'center'}>
                <Text w={'95%'} h={'30%'} as='h1' className='bionic'> Randomode </Text>

                <Text>
                    Your paddle will shrink or grow on every hit ! never know what's coming huhuhu.
                </Text>
            </Flex>
        </Box> 
    </Flex>
    )
}

export default PlayBox