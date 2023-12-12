import React, {useEffect, useState, useLayoutEffect} from 'react'
import {Flex, Box,Text, Avatar, Image} from '@chakra-ui/react'
import * as Constants from '../game/globals/const';
import authService from '../auth/auth.service'
import { LeftBracket, RightBracket } from '../game/game-creation/Brackets'
import PlayerHistoryAccordion from './PlayerHistoryAccordion';

function ProfileInfo() {
    const [user, setUser] = useState(undefined);
    const [fontSize, setFontSize] = useState(window.innerWidth > 1300 ? '2em' : '1em');
    const [secretImage, setSecretImage] = useState(false);
    
    useLayoutEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const me = await authService.get('http://127.0.0.1:4545/users/me');
                // console.log(user);
                const user = await authService.get('http://127.0.0.1:4545/users/profile/' + me?.data?.id);
                // console.log(user);
                setUser(user.data)
    
            } catch (err) {
                console.error(`${err.response.data.message} (${err.response.data.error})`)
            }
        }
    
        fetchUserProfile();
    }, []);

    useEffect(function DOMEvents() {

      function debounce(func : Function, ms : number) {
        let timer : string | number | NodeJS.Timeout;
    
        return ( function(...args : any) {
            clearTimeout(timer);
            timer = setTimeout( () => {
                timer = null;
                func.apply(this, args)
            }, ms);
        });
      };
  
      const debouncedHandleResize = debounce (function handleResize() {
        if (window.innerWidth > 1300)
          setFontSize('2em');
        else if (window.innerWidth > 1000)
          setFontSize('1.5em')
        else if (window.innerWidth < 800)
          setFontSize('1em')
      }, 100)
  
      window.addEventListener('resize', debouncedHandleResize)
  
      return(() => {
        window.removeEventListener('resize', debouncedHandleResize)
      })
    }, [fontSize]);

    return (<>
        <Box display={'flex'} flexDir={'row'} flexWrap={'wrap'}
        alignItems={'center'}
        justifyContent={'center'}
        width={'100%'}
        marginBottom={'20px'}
        >
            <Flex w={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
            marginBottom={'10%'}>
                {fontSize === '2em' ? <LeftBracket w={'16px'} h={'42px'} girth={'6px'} marginRight="-4px"/> : <LeftBracket w={'12px'} h={'32px'} girth={'4px'} marginRight="-4px"/>}
                    <Text fontWeight={'normal'} textAlign={'center'} padding={'0px'} fontSize={fontSize}
                    > 
                    {user?.username} 
                    </Text>
                {fontSize === '2em' ? <RightBracket w={'16px'} h={'42px'} girth={'6px'} marginLeft="-4px"/> : <RightBracket w={'12px'} h={'32px'} girth={'4px'} marginLeft="-4px"/>}
            </Flex>

            <Flex w={'100%'}
            justifyContent={'space-evenly'}
            flexDir={'row'}
            flexWrap={'wrap'}>
              <Box width={'160px'}>
                {!secretImage && <Image
                boxSize={'160px'}
                borderRadius={'full'}
                src={user?.id != undefined ? 'http://127.0.0.1:4545/users/avatar/' + user?.id : ""}
                onClick={() => setSecretImage(true)}
                ></Image>}
                {secretImage && <Image
                boxSize={'160px'}
                borderRadius={'full'}
                src={'https://decider.com/wp-content/uploads/2016/12/rats-morgan-spurlock-review.jpg?quality=75&strip=all&w=1200&h=800&crop=1'}
                onClick={() => setSecretImage(false)}
                ></Image>}
              </Box>

              <Box 
              display={'flex'} flexDir={'column'}
              alignContent={'left'}
              alignItems={'center'}
              justifyContent={'center'}
              >
                <Text textAlign={'center'} fontSize={fontSize}> WINS </Text>
                <Text textAlign={'center'} fontSize={fontSize}> {user?.winsAmount} </Text>
              </Box>

              <Box 
              display={'flex'} flexDir={'column'}
              alignContent={'left'}
              alignItems={'center'}
              justifyContent={'center'}
              >
                <Text textAlign={'center'} fontSize={fontSize}> LOOSES </Text>
                <Text textAlign={'center'} fontSize={fontSize}> {user?.loosesAmount} </Text>
              </Box>
              <Box width={'100%'}>
                <PlayerHistoryAccordion userId={user?.id} isOpen={true}/>
              </Box>
            </Flex>
        </Box>
    </>)
}

export default ProfileInfo