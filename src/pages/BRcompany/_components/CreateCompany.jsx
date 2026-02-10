    import { Button } from "@chakra-ui/react";
    import { apiLocations } from "../../../utils/Controllers/Locations";

    export default function CreateCompany(){


        const createCompany= async()=>{
            try{
                const response = await apiLocations.Add(data)
            }catch(error){
                console.log(error)
            }
        }

        return(
            <>
                <Button>
                    Yaratish
                </Button>
            </>
        )
    }