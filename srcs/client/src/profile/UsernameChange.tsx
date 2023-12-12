import { Button, Flex, FormControl, FormErrorMessage, FormHelperText, Input} from '@chakra-ui/react'
import * as Constants from '../game/globals/const'
import React, {useState} from 'react'
import { useForm } from 'react-hook-form';
import authService from '../auth/auth.service';


function UsernameChangeForm( props : {setFormVisible : Function}) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [formError, setFormError] = useState(false)
    const [formErrorMsg, setFormErrorMsg] = useState('')

    function validateUsername(username : string) {
        
        console.log('test')
        if (typeof username != 'string')
        {
            setFormErrorMsg('input is not a string');
            setFormError(true);
            return(false);
        }
        else if(username?.length < 3)
        {
            setFormErrorMsg('username is too short !');
            setFormError(true);
            return(false);
        }
        else if(username?.length > 20)
        {
            setFormErrorMsg('username is too long !');
            setFormError(true);
            return(false);
        }
        setFormError(false);
        return (true)
    }

    async function onChangeUsername(data : {newUsername : string}) {

        if (data === undefined || !data  || data?.newUsername === undefined)
            return ;
        
        if (!validateUsername(data.newUsername))
            return ;
        try {
            const res = await authService.patch(process.env.REACT_APP_SERVER_URL + '/users/', {username : data.newUsername})
            props.setFormVisible(false);
        }
        catch(err) {
            console.error(`${err.response.data.message} (${err.response.data?.error})`)
        }
    }

    return (
        <form onSubmit={handleSubmit(onChangeUsername)} style={{display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems: 'center'}}>
            <FormControl isRequired isInvalid={formError}>
                    <Input
                    borderRadius={'0px'}
                    type="text"
                    textAlign={'center'}
                    marginBottom={'10px'}
                    {
                        ...register("newUsername", {
                            required: "enter new username",
                        })
                    }
                    />
                    {!formError && <FormHelperText>Enter your new username !</FormHelperText>}
                    <FormErrorMessage> {formErrorMsg} </FormErrorMessage>
            </FormControl>

            <Button
            fontWeight={'normal'}
            w={'150px'}
            borderRadius={'0px'}
            marginTop={'10px'}
            textAlign={'center'}
            bg={'none'}
            textColor={'white'}
            _hover={{background : 'white', textColor : Constants.BG_COLOR}}
            type='submit'
            >
                Submit
            </Button>
        </form>
    )
}

function UsernameChange() {

    const [formVisible, setFormVisible] = useState(false)
    const text = formVisible ? "maybe not" : "Change my username"

    return (<>
            <Flex minH={'353px'}
        alignItems={'center'}
        justifyContent={'center'}
        flexDir={'column'}
        padding={'10px'}
        >
            <Button onClick={() => setFormVisible(formVisible ? false : true)}
            fontWeight={'normal'}
            borderRadius={'0px'}
            marginBottom={'10px'}
            bg={'none'}
            textColor={'white'}
            _hover={{background : 'white', textColor : Constants.BG_COLOR}}
            > 
            {text} 
            </Button>
            {formVisible && <UsernameChangeForm setFormVisible={setFormVisible}/>}
        </Flex>
    </>)
}

export default UsernameChange