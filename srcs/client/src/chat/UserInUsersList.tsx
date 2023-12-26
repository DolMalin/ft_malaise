import React, {useState, useEffect, useRef} from "react"
import authService from "../auth/auth.service"
import { Socket } from "socket.io-client";
import ProfileModal from "../profile/ProfileModal";
import { Room } from "./Chat";
import BasicToast from "../toast/BasicToast";
import { Image, Button, Link, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, Tooltip, useDisclosure, useToast } from "@chakra-ui/react";
import * as Constants from '../game/globals/const';

function UserInUsersList(props : {username : string, userId : string, 
    room : Room, userIsOp : boolean, gameSock? : Socket, chatSock?: Socket}) {

    const [priviColor, setPriviColor] = useState('grey');
    const [targetIsOp, setTargetIsOp] = useState<"isAdmin" | "isOwner" | "no">("no");
    const [targetIsMuted, setTargetIsMuted] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();


    async function makeThemOp(targetId : string, roomName : string, roomId : number) {
          try {
              await authService.post(process.env.REACT_APP_SERVER_URL + '/room/giveAdminPrivileges', 
              {targetId : targetId, roomName : roomName});
              setTargetIsOp('isAdmin')
              props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
          }
          catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
          }
    };

    async function fuckThemOp(targetId : string, roomName : string, roomId : number) {
        try {
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/removeAdminPrivileges', 
            {targetId : targetId, roomName : roomName});
            setTargetIsOp('no');
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    async function muteThem(targetId : string, roomId : number, timeInMinutes : number) {
        try {
            
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/muteUser', 
            {targetId : targetId, roomId : roomId, timeInMinutes : timeInMinutes});
            setTargetIsMuted(true);
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    async function unmuteThem(targetId : string, roomId : number) {
        try {
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/unmuteUser', 
            {targetId : targetId, roomId : roomId});
            setTargetIsMuted(false);
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 2000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    async function banThem(targetId : string, roomId : number, timeInMinutes : number) {
        try {

            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/banUser', 
            {targetId : targetId, roomId : roomId, timeInMinutes : timeInMinutes});
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
            props.chatSock?.emit('userGotBanned', {targetId : targetId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    function kick(roomId: number, targetId: string){
        props.chatSock?.emit('kick', {roomId: roomId, targetId: targetId})
    }

    useEffect(() => {
    async function asyncWrapper() {
        try {
            const privi = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/userPrivileges',
            {targetId : props?.userId, roomName : props.room?.name});

            if(privi.data === 'isOwner')
            {
                setPriviColor('blue')
                setTargetIsOp('isOwner')
            }
            else if(privi.data === 'isAdmin')
            {
                setPriviColor('green')
                setTargetIsOp('isAdmin')
            }
            else if (privi.data === 'isMuted')
            {
                setPriviColor('yellow')
                setTargetIsMuted(true);
            }
            else
            {
                setPriviColor('grey')
                setTargetIsOp('no')
            }
        }
        catch (err) {
            console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    asyncWrapper();
    })


    function MuteBanSlider(props : {targetId : string, roomId : number, actionName : string ,action : Function}) {
        const [sliderValue, setSliderValue] = React.useState(5)
        const [showTooltip, setShowTooltip] = React.useState(false)
        return (<>
            <Button onClick={() => props.action(props.targetId, props.roomId, sliderValue)}>
                {props.actionName}
            </Button>        
            <Slider
            id='slider'
            defaultValue={0}
            min={0}
            max={120}
            colorScheme='teal'
            onChange={(v) => setSliderValue(v)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                
                <Tooltip
                    hasArrow
                    bg='black'
                    color='white'
                    placement='top'
                    isOpen={showTooltip}
                    label={`${sliderValue}min`}
                >
                    <SliderThumb />
                </Tooltip>
            </Slider>
            <Text>zero minutes will set timer to an undefined amounth of time</Text>
        </>)
    }
    if (props.userIsOp)
    {
    return (<>
        <Link>
            <Popover>
                <PopoverTrigger>
                    <Button 
                    borderRadius={'0px'}
                    fontWeight={'normal'}
                    textColor={'black'}
                    paddingLeft={'12px'}
                    paddingRight={'12px'}
                    bg={'white'}
                    _hover={{bg : Constants.WHITE_BUTTON_HOVER}}
                    >
                        {targetIsOp === 'isOwner' && <Image boxSize={5} src={'./icons/blackSword.png'} marginRight={'3px'}/>}
                        {targetIsOp === 'isAdmin' && <Image boxSize={5} src={'./icons/blackShield.png'} marginRight={'3px'}/>}
                        {targetIsMuted && <Image boxSize={5} src={'./icons/blackMute.png'} marginRight={'3px'}/>}
                        
                        {props?.username}
                    </Button>
                </PopoverTrigger>

                <Portal>
                    <PopoverContent>
                        <PopoverBody>
                            {targetIsOp === 'no'  && <Button onClick={() => makeThemOp(props?.userId, props.room?.name, props.room?.id)}>
                                Promote
                            </Button>}

                            {targetIsOp === 'isAdmin' && <Button onClick={() => fuckThemOp(props?.userId, props.room?.name, props.room?.id)}>
                                Demote
                            </Button>}

                            <MuteBanSlider targetId={props?.userId} roomId={props.room?.id} actionName="ban" action={banThem}/>

                            {!targetIsMuted && <MuteBanSlider targetId={props?.userId} roomId={props.room?.id} actionName="mute" action={muteThem}/>}
                            <Button onClick={() => unmuteThem(props?.userId, props.room?.id)}>
                                unmute
                            </Button>
                            <Button onClick={() => kick(props?.room.id, props?.userId)}>
                                kick
                            </Button>
                            <Button onClick={onOpen}>
                                profile
                            </Button>
                        </PopoverBody>
                    </PopoverContent>
                </Portal>
            </Popover>
        </Link>

        <ProfileModal userId={props.userId} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.chatSock} gameSock={props.gameSock}/>
    </>)
    }
    else {
        return (<>
            <Button onClick={onOpen}
            borderRadius={'0px'}
            fontWeight={'normal'}
            textColor={'black'}
            paddingLeft={'12px'}
            paddingRight={'12px'}
            bg={'white'}
            _hover={{bg : Constants.WHITE_BUTTON_HOVER}}
            >
                {targetIsOp === 'isOwner' && <Image boxSize={5} src={'./icons/blackSword.png'} marginRight={'3px'}/>}
                {targetIsOp === 'isAdmin' && <Image boxSize={5} src={'./icons/blackShield.png'} marginRight={'3px'}/>}
                {targetIsMuted && <Image boxSize={5} src={'./icons/blackMute.png'} marginRight={'3px'}/>}
                {props?.username}
            </Button>
            <ProfileModal userId={props.userId} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.chatSock} gameSock={props.gameSock}/>
        </>)
    }
}

export default UserInUsersList