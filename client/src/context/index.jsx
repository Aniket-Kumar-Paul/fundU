import React, {useContext, createContext} from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({children}) => {
    // contract address
    const {contract} = useContract('0x8526414eA276f455C6514ca7483212c0f2b76AE2'); 
    const {mutateAsync: createCampaign} = useContractWrite(contract, 'createCampaign'); // (contract, functionName)

    // wallet address
    const address = useAddress();
    const connect = useMetamask();

    const publishCampaign = async(form) => {
        try {
            const data = await createCampaign([
                address,
                form.title,
                form.description,
                form.target,
                new Date(form.deadline).getTime(),
                form.image
            ])
            console.log("Contract Call Success", data)
        } catch (error) {
            console.log("Contract Call Failure", error)
        }
    }

    return (
        <StateContext.Provider
            // value is going to be shared to all the components
            value={{
                address,
                contract,
                connect,
                createCampaign: publishCampaign, // rename publishCampaign to createCampaign 
            }} 
        >
            {children}
        </StateContext.Provider>
    )
}

// Use the context using this custom hook
export const useStateContext = () => useContext(StateContext);