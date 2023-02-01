import React, { useContext, createContext } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    // contract address
    const { contract } = useContract('0x995216d87C0c348c236BB48C32F0EFb07e4eD6d6');
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign'); // (contract, functionName)

    // wallet address
    const address = useAddress();
    const connect = useMetamask();

    const publishCampaign = async (form) => {
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

    const getCampaigns = async () => {
        const campaigns = await contract.call('getCampaigns');

        const parsedCampaigns = campaigns.map((campaign, index) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: index
        }));

        return parsedCampaigns;
    }

    const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns();

        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

        return filteredCampaigns;
    }

    const donate = async (pId, amount) => {
        const data = contract.call(
            'donateToCampaign',
            pId, { value: ethers.utils.parseEther(amount) }
        );
        return data;
    }

    const getDonations = async (pId) => {
        const donations = await contract.call('getDonators', pId);
        // donations[0] -> donators addresses, donations[1] -> donation amounts
        const numberOfDonations = donations[0].length;

        const parsedDonations = [];

        for (let i = 0; i < numberOfDonations; i++) {
            parsedDonations.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString())
            })
        }

        return parsedDonations;
    }

    return (
        <StateContext.Provider
            // value is going to be shared to all the components
            value={{
                address,
                contract,
                connect,
                createCampaign: publishCampaign, // rename publishCampaign to createCampaign 
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations
            }}
        >
            {children}
        </StateContext.Provider>
    )
}

// Use the context using this custom hook
export const useStateContext = () => useContext(StateContext);