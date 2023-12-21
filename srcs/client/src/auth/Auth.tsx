import axios from 'axios'
import React, { Component, useEffect, useState, useReducer} from 'react'
import AuthService from './auth.service'
import { Button, Link, Input, FormControl, Flex, Box, Text} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import { Socket } from 'socket.io-client'
import reducer, {stateType} from './components/reducer'
import * as Constants from '../game/globals/const'
import { LeftBracket, RightBracket} from '../game/game-creation/Brackets';


function Auth(props : {state: stateType, dispatch: Function, gameSock : Socket}) {
	const [authUrl, setAuthUrl] = useState('')

	const [state, dispatch] = useReducer(reducer, {
		isAuthenticated: props.state.isAuthenticated,
		isRegistered: props.state.isRegistered,
		isTwoFactorAuthenticated: props.state.isTwoFactorAuthenticated,
		isTwoFactorAuthenticationEnabled: props.state.isTwoFactorAuthenticationEnabled
	})

	useEffect(() => {

		props.gameSock?.on('logout', () => {
			dispatch({type : 'SET_IS_AUTHENTICATED', payload : false});
		})

		return (() => {
			props.gameSock?.off('logout');
		})
	}, [props.gameSock])

	// move in service
	const fetchAuthUrl = async () => {
		try {
			const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/redirect`)
			setAuthUrl(res.data.url)
		} catch (err) {
		}
	}

	const validate = async () => {

		try {
			
			const res = await AuthService.validate()
			props.dispatch({type: 'SET_IS_AUTHENTICATED', payload: true})
			dispatch({type: 'SET_IS_AUTHENTICATED', payload: true})

			props.dispatch({type: 'SET_IS_REGISTERED', payload: res.data?.isRegistered})
			dispatch({type: 'SET_IS_REGISTERED', payload: res.data?.isRegistered})
			
			props.dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload: res.data?.isTwoFactorAuthenticationEnabled})
			dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload: res.data?.isTwoFactorAuthenticationEnabled})

			props.dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: res.data?.isTwoFactorAuthenticated})
			dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: res.data?.isTwoFactorAuthenticated})

			return 200
		} catch (err) {
			props.dispatch({type: 'SET_IS_AUTHENTICATED', payload: false})
			dispatch({type: 'SET_IS_AUTHENTICATED', payload: false})

			props.dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: false})
			dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: false})

			console.error(`${err.response.data.message} (${err.response.data.error})`)
			return err.response.status
		}
	}

	const logout = async () => {
		try {
			props.dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
			
			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:false})
			await AuthService.logout(state.isTwoFactorAuthenticated, props.gameSock)
			window.location.reload()
		} catch(err) {
			console.error(`${err.response.data.message} (${err.response.data.error})`)
		}
	}

	const onSubmit2fa = async (data:any) => {
		try {
			await AuthService.twoFactorAuthenticationLogin(data.twoFactorAuthenticationCode)

			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:true})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:true})
		} catch(err) {
			console.error(`${err.response.data.message} (${err.response.data.error})`)
		}
	}

	const onSubmit = async (data:any, e:any) => {
		e.preventDefault()
		try {
			const formData = new FormData()
			if (data.avatar)
				formData.append("file", data.avatar[0])
			formData.append("username", data.username)


			await AuthService.register(formData)

			props.dispatch({type:'SET_IS_REGISTERED', payload:true})
			dispatch({type:'SET_IS_REGISTERED', payload:true})
		} catch(err) {
			console.error(`${err.response.data.message} (${err.response.data.error})`)
		}
	}


	function LoginComponent() {
		return (
			<div className="Log">
				<Button fontWeight={'normal'}>
					<Link href={authUrl}>Log in with 42</Link>
			</Button>
			</div>
		)
	}

	function RegisterComponent() {
		const { register, handleSubmit, formState: { errors } } = useForm();
		return ( 
				<Flex width={'100%'} height={'100%'}
				alignItems={'center'}
				justifyContent={'center'}
				className='goma'
				>
					<Flex 
					height={'320px'}
					width={'320px'}
					bg={Constants.BG_COLOR_FADED}
					justifyContent={'space-evenly'}
					alignItems={'center'}
					flexDir={'column'}
					>
						<form onSubmit={handleSubmit(onSubmit)} style={{height : '320px', width : '320px'}}>
							<Flex
							width={'100%'}
							height={'50%'}
							display={'flex'} flexDir={'column'} 
							alignItems={'center'}
							justifyContent={'center'}
							>
								<FormControl isRequired>
									<Input
									w={'90%'}
									type="text"
									borderRadius={'0px'}
									focusBorderColor="white"
									textColor={'white'}
									placeholder="Nom d'utilisateur"
									{
										...register("username", {
											required: "Please enter first name",
											minLength: 3,
											maxLength: 20,
										})
										}
										/>

									<Input
									w={'90%'}
									borderRadius={'0px'}
									border={'none'}
									textColor={'white'}
									required={false}
									type="file"
									{
										...register("avatar", {
										})
									}
									accept="image/*"
									/>
								</FormControl>
							</Flex>
							

							<Flex
							w={'100%'}
							h={'50%'}
							alignItems={'center'} 
							justifyContent={'center'}
							>
								<LeftBracket w={'20px'} h={'100px'} girth={'8px'} marginRight='-8px'/>
									<Button 	
										fontSize={'2xl'}
										fontWeight={'normal'}
										textColor={'white'}
										bgColor={Constants.BG_COLOR_FADED}
										h={'78px'}
										borderRadius={'0px'}
										type='submit'
										className='goma'
										>
											Register
									</Button>
								<RightBracket w={'20px'} h={'100px'} girth={'8px'} marginLeft='-8px'/>
							</Flex>
						</form>
					</Flex>
				</Flex>
		)
	}

	function LogoutComponent() {
		return (
			<div className="Log">
				<Box width={'sm'} height={'sm'}
				display={'flex'} flexDir={'row'} 
				alignItems={'center'} justifyContent={'center'
			}>
					<LeftBracket w={'20px'} h={'100px'} girth={'10px'}/>
						<Button 	
							fontSize={'2xl'}
							fontWeight={'normal'}
							textColor={'white'}
							bgColor={Constants.BG_COLOR}
							h={'100px'}
							borderRadius={'0px'}
							onClick={logout}
							className='goma'
							>
								Logout
						</Button>
					<RightBracket w={'20px'} h={'100px'} girth={'10px'}/>
				</Box>
			</div>
		)
	}

	function TwoFactorAuthenticationComponent() {
		const { register, handleSubmit, formState: { errors } } = useForm();

		return (<>
					<form onSubmit={handleSubmit(onSubmit2fa)}>
						<FormControl isRequired>

						<Box width={'sm'} height={'sm'}
                		display={'flex'} flexDir={'row'} 
                		alignItems={'center'} justifyContent={'center'
						}>
							<LeftBracket w={'20px'} h={'100px'} girth={'10px'}/>
								<Input
									type="text"
									placeholder="2fa code"
									border="none"
									outline="none"
									{
										...register("twoFactorAuthenticationCode", {
											required: "enter 2facode",
											minLength: 3,
											maxLength: 80
										})
									}
									/>
							<RightBracket w={'20px'} h={'100px'} girth={'10px'}/>
						</Box>

						</FormControl>

						<Box width={'sm'} height={'sm'}
                		display={'flex'} flexDir={'row'} 
                		alignItems={'center'} justifyContent={'center'
					}>
							<LeftBracket w={'20px'} h={'100px'} girth={'10px'}/>
								<Button
									fontSize={'2xl'}
									fontWeight={'normal'}
									bgColor={Constants.BG_COLOR}
									h={'100px'}
									borderRadius={'0px'}
									type='submit'
									textColor={'white'}
									className='goma'
									>
									Forward !
								</Button>
							<RightBracket w={'20px'} h={'100px'} girth={'10px'}/>
						</Box>
					</form>
					<LogoutComponent/>

		</>
		)
	}


	useEffect(() => {
        async function asyncWrapper() {
        fetchAuthUrl()
        const status = await validate();
        if (status === 200) {
			props.dispatch({type:'SET_IS_AUTHENTICATED', payload:true})
			dispatch({type:'SET_IS_AUTHENTICATED', payload:true})
		} else {
			props.dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
		}
    };
    asyncWrapper();
    }, [state.isAuthenticated, state.isRegistered, state.isTwoFactorAuthenticated])

	return (<>
		{/* <Flex background={Constants.BG_COLOR}
		minW={'320px'}
		h={'100vh'}
		overflow={'auto'}
		> */}
			{state.isAuthenticated && (!state.isTwoFactorAuthenticated && state.isTwoFactorAuthenticationEnabled) && <TwoFactorAuthenticationComponent />}
			{ state.isAuthenticated && !state.isRegistered && <RegisterComponent/>}
			{!state.isAuthenticated && <LoginComponent />}
		{/* </Flex> */}
	</>)
}

export default Auth