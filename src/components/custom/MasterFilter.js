import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useCombobox } from 'downshift';
import { CHeaderNav } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import BasicProvider from 'src/constants/BasicProvider';

const formatInitiateDate = (item) => {
    const date = item?.date_initiation_bank || item?.date_initiation_RA;
    if (!date) return '';
    const formatted = moment(date);
    return formatted.isValid() ? formatted.format('DD MMM YYYY') : '';
};

const MasterFilter = ({ userData }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [inputFocused, setInputFocused] = useState(false);
    const listRef = useRef(null);
    const searchInputRef = useRef('');  // Store the current search input

    // Function to fetch data
    const handleSearch = useCallback(async (query, page = currentPage, append = false) => {
        if (query.trim().length < 2) {
            if (options.length > 0) {
                setOptions([]);
            }
            return;
        }

        setLoading(true);
        try {
            console.log('Fetching data for page:', page, 'Query:', query); // Debug log

            // Backend should match search_input against applicant_name and los_number (LOS no.)
            const response = await new BasicProvider(
                `cases/master-filter?search_input=${encodeURIComponent(query.trim())}&count=10&page=${page}`,
                dispatch,
            ).getRequest();

            const backendResponse = response.data.data;
            const dataArray = Array.isArray(backendResponse) ? backendResponse : [backendResponse];
            const roleName = userData?.role?.[0]?.name || 'only-see';

            const newOptions = dataArray.map((item) => ({
                name: item?.applicant_name || 'Unknown',
                value: item?.applicant_name || 'Unknown',
                financeName: item?.finance_name?.name || (typeof item?.finance_name === 'string' ? item.finance_name : '') || '',
                initiateDate: formatInitiateDate(item),
                url: `/case/${item?._id}/show-case-details/by/${roleName}`,
            }));

            // Preserve scroll position when appending new data
            const scrollPos = listRef.current?.scrollTop;

            setOptions((prevOptions) => {
                const updatedOptions = append ? [...prevOptions, ...newOptions] : newOptions;

                // Restore scroll position after state update
                setTimeout(() => {
                    if (listRef.current && scrollPos) {
                        listRef.current.scrollTop = scrollPos;
                    }
                }, 0);

                return updatedOptions;
            });

            setHasNextPage(response.data.hasNextPage);

        } catch (error) {
            console.error('Error fetching data:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [dispatch, userData]);

    // Handle infinite scroll
    const handleScroll = useCallback((e) => {
        const element = e.target;
        if (!element) return;

        const bottom = Math.abs(
            element.scrollHeight - element.scrollTop - element.clientHeight
        ) <= 1;

        if (bottom && !loading && hasNextPage) {
            console.log('Loading more data for page:', currentPage + 1); // Debug log
            setCurrentPage(prev => prev + 1);
            handleSearch(searchInputRef.current, currentPage + 1, true);
        }
    }, [loading, hasNextPage, currentPage, handleSearch]);

    const combobox = useCombobox({
        items: options,
        onInputValueChange: ({ inputValue }) => {
            if (inputValue) {
                searchInputRef.current = inputValue; // Store the current search input
                setOptions([]);
                setCurrentPage(1);
                setIsFirstLoad(false);
                handleSearch(inputValue, 1, false);
            }
        },
        onSelectedItemChange: ({ selectedItem }) => {
            if (selectedItem?.url) {
                setInputFocused(false);
                setOptions([]);
                navigate(selectedItem.url);
            }
        },
        itemToString: (item) => (item ? item.name : ''),
    });

    const {
        isOpen,
        getMenuProps,
        getInputProps,
        getItemProps,
        highlightedIndex,
        inputValue
    } = combobox;

    useEffect(() => {
        const listElement = listRef.current;
        if (listElement) {
            listElement.addEventListener('scroll', handleScroll);
            return () => listElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);


    return (
        <CHeaderNav className="d-none d-md-flex me-auto header_main_search">
            <div className="header-search-shell" style={{ position: 'relative', width: '100%' }}>
                <input
                    {...getInputProps({
                        placeholder: 'Master search for report..',
                        className: 'white-placeholder header-search-input', // Keeps the white placeholder class from the previous step
                        onFocus: () => setInputFocused(true),
                        onBlur: () => setTimeout(() => setInputFocused(false), 200),
                        style: {
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: 'white'
                        },
                    })}
                />
                <ul
                    {...getMenuProps()}
                    ref={listRef}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        zIndex: 1000,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        display: (isOpen || inputFocused) && options.length > 0 ? 'block' : 'none',
                    }}
                >
                    {options.map((item, index) => (
                        <li
                            key={`${item.name}-${item.url}-${index}`}
                            {...getItemProps({ item, index })}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                                backgroundColor: highlightedIndex === index ? '#bde4ff' : '#fff',
                                borderBottom: index !== options.length - 1 ? '1px solid #eee' : 'none',
                            }}
                        >
                            <div>{item.name}</div>
                            {(item.financeName || item.initiateDate) ? (
                                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                    {item.financeName}
                                    {item.financeName && item.initiateDate ? ' · ' : ''}
                                    {item.initiateDate ? `Initiate: ${item.initiateDate}` : ''}
                                </div>
                            ) : null}
                        </li>
                    ))}
                    {loading && (
                        <li style={{ padding: '8px', textAlign: 'center' }}>Loading...</li>
                    )}
                    {!loading && hasNextPage && options.length > 0 && (
                        <li style={{ padding: '8px', textAlign: 'center', color: '#666' }}>
                            Scroll for more...
                        </li>
                    )}
                </ul>
            </div>
        </CHeaderNav>
    );
};

export default MasterFilter;



//backup
// import React, { useCallback, useState, useRef, useEffect } from 'react';
// import { useCombobox } from 'downshift';
// import { CHeaderNav } from '@coreui/react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import BasicProvider from 'src/constants/BasicProvider';

// const MaterFilter = ({ userData }) => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [options, setOptions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [hasNextPage, setHasNextPage] = useState(true);
//     const [isFirstLoad, setIsFirstLoad] = useState(true);
//     const listRef = useRef(null);

//     // Function to fetch data
//     const handleSearch = useCallback(async (query) => {
//         if (query.trim().length < 2) {
//             if (options.length > 0) {
//                 setOptions([]);
//             }
//             return;
//         }
//         setLoading(true);
//         try {
//             const response = await new BasicProvider(
//                 `cases/master-filter?search_input=${query.trim()}&count=10&page=${currentPage}`,
//                 dispatch,
//             ).getRequest();

//             const backendResponse = response.data.data;
//             const dataArray = Array.isArray(backendResponse) ? backendResponse : [backendResponse];
//             const roleName = userData?.role?.[0]?.name || 'only-see';

//             const newOptions = dataArray.map((item) => ({
//                 name: item?.applicant_name || 'Unknown',
//                 value: item?.applicant_name || 'Unknown',
//                 url: `/case/${item?._id}/show-case-details/by/${roleName}`,
//             }));

//             // Append new data to existing options
//             setOptions((prevOptions) => [...prevOptions, ...newOptions]);
//             setHasNextPage(response.data.hasNextPage);


//         } catch (error) {
//             console.error('Error fetching data:', error);
//             setOptions([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [dispatch, userData, currentPage]);

//     const {
//         isOpen,
//         getMenuProps,
//         getInputProps,
//         getItemProps,
//         highlightedIndex,
//         inputValue,
//     } = useCombobox({
//         items: options,
//         onInputValueChange: ({ inputValue }) => {
//             if (inputValue) {
//                 setOptions([]);
//                 setCurrentPage(1);
//                 setIsFirstLoad(false);
//                 handleSearch(inputValue);
//             }
//         },
//         onSelectedItemChange: ({ selectedItem }) => {
//             if (selectedItem?.url) {
//                 navigate(selectedItem.url);
//             }
//         },
//         itemToString: (item) => (item ? item.name : ''),
//     });

//     // Handle infinite scroll
//     const handleScroll = (e) => {
//         const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
//         if (bottom && !loading && hasNextPage) {
//             setCurrentPage((prevPage) => prevPage + 1);
//             handleSearch(inputValue);
//         }

//     };

//     return (
//         <CHeaderNav className="d-none d-md-flex me-auto header_main_search">
//             <div style={{ position: 'relative', width: '100%' }}>
//                 <input
//                     {...getInputProps({
//                         placeholder: 'Type to search...',
//                         style: {
//                             width: '100%',
//                             padding: '8px',
//                             borderRadius: '4px',
//                             border: '1px solid #ccc',
//                         },
//                     })}
//                 />
//                 <ul
//                     {...getMenuProps()}
//                     onScroll={handleScroll}
//                     ref={listRef}
//                     style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: 0,
//                         right: 0,
//                         backgroundColor: '#fff',
//                         border: '1px solid #ccc',
//                         borderRadius: '4px',
//                         margin: 0,
//                         padding: 0,
//                         listStyle: 'none',
//                         zIndex: 1000,
//                         maxHeight: '400px',
//                         overflowY: 'auto',
//                     }}
//                 >
//                     {
//                         loading ? (
//                             <li style={{ padding: '8px', textAlign: 'center' }}>Loading...</li>
//                         ) : (
//                             isOpen &&
//                             options.map((item, index) => (
//                                 <li
//                                     key={index}
//                                     {...getItemProps({ item, index })}
//                                     style={{
//                                         padding: '8px',
//                                         cursor: 'pointer',
//                                         backgroundColor: highlightedIndex === index ? '#bde4ff' : '#fff',
//                                         borderBottom: index !== options.length - 1 ? '1px solid #eee' : 'none',
//                                     }}
//                                 >
//                                     {item.name}
//                                 </li>
//                             ))
//                         )
//                     }
//                 </ul>
//             </div>
//         </CHeaderNav>
//     );

// };

// export default MaterFilter;
