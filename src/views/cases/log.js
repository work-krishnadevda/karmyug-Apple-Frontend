import React, { useEffect, useRef, useState } from 'react';
const { VerticalTimeline, VerticalTimelineElement } = require("react-vertical-timeline-component");
import { CCard, CCardBody, CContainer } from '@coreui/react';
import 'react-vertical-timeline-component/style.min.css';
import SingleSubHeader from 'src/components/custom/SingleSubHeader';
import BasicProvider from 'src/constants/BasicProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import moment from 'moment'
import FeShowDeatils from 'src/components/custom/department/forms/FE/Feshowdetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGhost } from '@fortawesome/free-solid-svg-icons';

export default function Logs() {
    var params = useParams()
    var dispatch = useDispatch()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const id = params.id

    let [data, setData] = useState({})

    useEffect(() => {
        fetchData()
    }, [id])

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {

            const [response] = await Promise.all([
                new BasicProvider(`cases/logs/${id}`).getRequest(),
            ]);

            if (response?.data) {
                setData(response?.data);
            }


        } catch (error) {
            console.error(error);
        }
    };

    const formatDateIfValid = (value) => {
        const parsedDate = moment(value, moment.ISO_8601, true);
        return parsedDate.isValid() ? parsedDate.format('DD MMM YYYY hh:mm A') : value;
    };

    const RenderObject = ({ data }) => {
        return (
            <>
                {Object.entries(data).map(([key, value], index) => {
                    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                        if (value._id && value.name) {
                            return (
                                <div key={index} className="vertical-timeline-element-subtitle">
                                    <strong>{key} : </strong> {value.name}
                                </div>
                            );
                        }
                        return (
                            <div key={index} className="nested-object">
                                <strong>{key} : </strong>
                                <div className="px-5">
                                    <RenderObject data={value} />
                                </div>
                            </div>
                        );
                    }

                    if (Array.isArray(value)) {
                        return (
                            <div key={index} className="array-object">
                                <strong>{key} : </strong>
                                {value.map((arrayItem, arrayIndex) => (
                                    <div key={arrayIndex} className="px-5">
                                        {typeof arrayItem === 'object' ? (
                                            <RenderObject data={arrayItem} />
                                        ) : (
                                            <p>{arrayItem}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    return (
                        <div>
                            <strong>{key} : </strong> {formatDateIfValid(value)}
                        </div>
                    );
                })}
            </>
        );
    };


    return (
        <>
            <SingleSubHeader moduleName={'Case Update Logs'} />
            <CContainer fluid>
                <FeShowDeatils showCaseData={data} />
                <VerticalTimeline
                    layout='1-column-left'
                    animate={false}
                >
                    {data.caseupdatelogs && data.caseupdatelogs?.length > 0 ? data.caseupdatelogs?.map((item, index) => (
                        <VerticalTimelineElement
                            icon={<FontAwesomeIcon icon={faGhost} />}
                            key={index}
                            className="vertical-timeline-element--work"
                            contentStyle={{ background: item?.role_id[0]?.color, color: "#000" }}
                            date={item.date}
                            iconStyle={{ background: item?.role_id[0]?.color, color: "#000" }}
                        >
                            <div className="d-flex align-items-center justify-content-between">
                                <h3 className="vertical-timeline-element-title">{item?.message} By {item?.user_id?.name}</h3>
                                <span className="vertical-timeline-element-subtitle">{moment(item?.created_at).format('DD MMM YYYY hh:mm A')}</span>
                            </div>
                            <div className="pt-2">
                                {item?.update_data && <RenderObject data={item?.update_data} />}
                            </div>

                        </VerticalTimelineElement>
                    )) : ''}
                </VerticalTimeline>
            </CContainer>
        </>
    )
}
