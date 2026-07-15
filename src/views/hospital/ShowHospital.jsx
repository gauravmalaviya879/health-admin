import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
    Box,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Grid,
    Avatar,
    Button,
    Card,
    CardContent,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';

import {
    IconArrowLeft,
    IconBuildingHospital,
    IconUser,
    IconMapPin,
    IconFileText,
    IconBuildingBank,
    IconEye
} from '@tabler/icons-react';

import hospitalService from '../../services/newHospitalService';



const LabelValue = ({ label, value }) => (
    <Box mb={1.5}>
        <Typography
            variant="subtitle2"
            color="text.secondary"
        >
            {label}
        </Typography>

        <Typography variant="body1">
            {value || 'N/A'}
        </Typography>

    </Box>
);



const TabPanel = ({ value, index, children }) => (
    <div hidden={value !== index}>
        {
            value === index &&
            <Box pt={2}>
                {children}
            </Box>
        }
    </div>
);



const ImageCard = ({ title, url }) => (

    <Card variant="outlined">

        <CardContent>

            <Typography
                variant="subtitle2"
                mb={1}
            >
                {title}
            </Typography>


            <Box
                sx={{
                    height: 180,
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: '#f5f5f5'
                }}
            >

                {
                    url ?

                        <img
                            src={url}
                            alt={title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />

                        :

                        <Typography>
                            No Document
                        </Typography>

                }



                {
                    url &&
                    <Button

                        size="small"

                        variant="contained"

                        startIcon={<IconEye size={16} />}

                        onClick={() => window.open(url, '_blank')}

                        sx={{
                            position: 'absolute',
                            right: 8,
                            bottom: 8
                        }}

                    >
                        Open
                    </Button>

                }


            </Box>


        </CardContent>

    </Card>

);



const ShowHospital = () => {


    const { id } = useParams();

    const navigate = useNavigate();


    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [tab, setTab] = useState(0);



    useEffect(() => {


        const fetchData = async () => {

            try {

                const res =
                    await hospitalService.getHospitalById(id);


                setData(res.data.Data);


            }
            catch (error) {

                console.log(error);

            }
            finally {

                setLoading(false);

            }

        };


        fetchData();


    }, [id]);





    if (loading)

        return (

            <Box
                display="flex"
                justifyContent="center"
                mt={10}
            >

                <CircularProgress />

            </Box>

        );



    return (

        <Box>


            <Button

                startIcon={<IconArrowLeft />}

                onClick={() => navigate(-1)}

                sx={{ mb: 2 }}

            >
                Back
            </Button>




            <Paper sx={{ p: 3 }}>


                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >


                    <Avatar

                        src={data?.logo}

                        sx={{
                            width: 140,
                            height: 140
                        }}

                    />


                    <Typography
                        variant="h5"
                        mt={2}
                    >

                        {data?.hospitalname}

                    </Typography>


                    <Box mt={1}>

                        <Chip

                            label={data?.status}

                            color={
                                data?.status === "Approved"
                                    ?
                                    "success"
                                    :
                                    "warning"
                            }

                        />

                    </Box>


                </Box>





                <Tabs

                    value={tab}

                    onChange={(e, v) => setTab(v)}

                    variant="scrollable"

                    sx={{ mt: 3 }}

                >


                    <Tab
                        icon={<IconBuildingHospital size={18} />}
                        iconPosition="start"
                        label="Hospital Details"
                    />


                    <Tab
                        icon={<IconUser size={18} />}
                        iconPosition="start"
                        label="Contact"
                    />


                    <Tab
                        icon={<IconBuildingBank size={18} />}
                        iconPosition="start"
                        label="Finance"
                    />


                    <Tab
                        icon={<IconMapPin size={18} />}
                        iconPosition="start"
                        label="Branches"
                    />


                    <Tab
                        icon={<IconFileText size={18} />}
                        iconPosition="start"
                        label="Documents"
                    />


                </Tabs>





                <TabPanel value={tab} index={0}>


                    <Grid container spacing={3}>


                        <Grid item md={4}>

                            <LabelValue
                                label="Legal Entity Name"
                                value={data?.legalentityname}
                            />


                            <LabelValue
                                label="Hospital Type"
                                value={data?.hospitaltype}
                            />


                            <LabelValue
                                label="Registration Number"
                                value={data?.registrationnumber}
                            />


                        </Grid>



                        <Grid item md={4}>


                            <LabelValue
                                label="GST Number"
                                value={data?.gstnumber}
                            />


                            <LabelValue
                                label="PAN Number"
                                value={data?.pannumber}
                            />


                            <LabelValue
                                label="Establishment Year"
                                value={data?.establishmentyear}
                            />


                        </Grid>




                        <Grid item md={4}>


                            <LabelValue
                                label="Website"
                                value={data?.websiteurl}
                            />


                            <LabelValue
                                label="Summary"
                                value={data?.summary}
                            />


                        </Grid>


                    </Grid>


                </TabPanel>







                <TabPanel value={tab} index={1}>


                    <Grid container spacing={3}>


                        <Grid item md={6}>


                            <LabelValue
                                label="Email"
                                value={data?.email}
                            />


                            <LabelValue
                                label="Mobile"
                                value={data?.mobile}
                            />


                        </Grid>



                        <Grid item md={6}>


                            <LabelValue
                                label="Contact Person"
                                value={data?.contactpersonname}
                            />


                            <LabelValue
                                label="Designation"
                                value={data?.designation}
                            />


                            <LabelValue
                                label="Contact Mobile"
                                value={data?.contactpersonmobile}
                            />


                            <LabelValue
                                label="Contact Email"
                                value={data?.contactpersonemail}
                            />


                        </Grid>


                    </Grid>


                </TabPanel>







                <TabPanel value={tab} index={2}>


                    <Grid container spacing={3}>


                        <Grid item md={6}>


                            <LabelValue
                                label="Bank Name"
                                value={data?.bankname}
                            />


                            <LabelValue
                                label="Account Holder"
                                value={data?.accountholdername}
                            />


                            <LabelValue
                                label="Account Number"
                                value={data?.accountnumber}
                            />


                        </Grid>



                        <Grid item md={6}>


                            <LabelValue
                                label="IFSC"
                                value={data?.ifsccode}
                            />


                            <LabelValue
                                label="Branch"
                                value={data?.bankbranchname}
                            />


                            <LabelValue
                                label="Available Tenure"
                                value={data?.availabletenures}
                            />


                            <LabelValue
                                label="Down Payment Required"
                                value={data?.downpaymentrequired}
                            />


                        </Grid>


                    </Grid>



                    <Typography mt={2}>
                        Interest Type
                    </Typography>


                    {
                        data?.interesttype?.map((x, i) => (

                            <Chip
                                key={i}
                                label={x}
                                sx={{ mr: 1 }}
                            />

                        ))

                    }



                </TabPanel>







                <TabPanel value={tab} index={3}>


                    {
                        data?.branchdetails?.map((branch, index) => (


                            <Card
                                key={index}
                                sx={{ mb: 2 }}
                            >


                                <CardContent>


                                    <Typography variant="h6">

                                        {branch.branchname}

                                    </Typography>


                                    <LabelValue
                                        label="Location"
                                        value={`${branch.city}, ${branch.state} - ${branch.pincode}`}
                                    />


                                    <LabelValue
                                        label="Landmark"
                                        value={branch.landmark}
                                    />


                                    <LabelValue
                                        label="Surgery Percentage"
                                        value={`${branch.surgeryPercentage}%`}
                                    />


                                    <LabelValue
                                        label="Consultation Percentage"
                                        value={`${branch.consultationsPercentage}%`}
                                    />



                                    <Grid container spacing={2}>


                                        {
                                            branch.photos?.map((photo, i) => (

                                                <Grid item md={3} key={i}>

                                                    <ImageCard
                                                        title="Branch Photo"
                                                        url={photo}
                                                    />

                                                </Grid>

                                            ))

                                        }


                                    </Grid>


                                </CardContent>


                            </Card>


                        ))

                    }



                </TabPanel>







                <TabPanel value={tab} index={4}>


                    <Grid container spacing={2}>


                        {
                            [
                                ['Hospital Registration', data?.hospitalregistrationcertificate],
                                ['NABH Certificate', data?.nabhcertificate],
                                ['GST Certificate', data?.gstcertificate],
                                ['PAN Copy', data?.pancopy],
                                ['Authorized Signatory', data?.authorizedsignatoryidproof],
                                ['Cancelled Cheque', data?.cancelledchequenupload]
                            ]
                                .map(([title, url]) => (


                                    <Grid item md={4} key={title}>


                                        <ImageCard
                                            title={title}
                                            url={url}
                                        />


                                    </Grid>


                                ))


                        }


                    </Grid>


                </TabPanel>





            </Paper>


        </Box>


    )

};
export default ShowHospital;