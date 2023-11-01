import _ from 'lodash';
import {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import * as actions from 'actions';
import {trRecordsByIds} from 'selectors';

export default function useTRRecords() {
    const urlParams = new URLSearchParams(window.location.search);

    const dispatch = useDispatch();
    const [recordIds, setRecordIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(_.toInteger(urlParams.get('page')) || 1);
    const [perPage, setPerPage] = useState(20);
    const [numPages, setNumPages] = useState();
    const [count, setCount] = useState();

    const getTRRecords = useCallback(
        ({fetcherFilters = {}, page: newPage = 1} = {}) => {
            setLoading(true);
            return dispatch(
                actions.TRRecord.trRecordsGetList({
                    ...fetcherFilters,
                    page: newPage,
                    per_page: perPage,
                }),
            ).withMeta.then((resp) => {
                setPage(resp.meta?.pagination?.page);
                setPerPage(resp.meta?.pagination?.per_page);
                setNumPages(resp.meta?.pagination?.num_pages);
                setCount(resp.meta?.pagination?.count);
                setRecordIds(resp.response.map((r) => r.id));
                setLoading(false);
            });
        },
        [dispatch, perPage],
    );

    return {
        loading,
        trRecords: useSelector(trRecordsByIds(recordIds)),
        page,
        numPages,
        count,
        setPage,
        getTRRecords,
    };
}
