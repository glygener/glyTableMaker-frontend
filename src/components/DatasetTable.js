import { useEffect, useMemo, useState } from "react";
import { axiosError } from "../utils/axiosError";
import { MaterialReactTable, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, MRT_ToggleGlobalFilterButton, useMaterialReactTable } from "material-react-table";
import { Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getJson } from "../utils/api";
import { Box } from "@mui/material";


const DatasetTable = props => {

    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [descOpen, setDescOpen] = useState(false);

    // table data
    const [data, setData] = useState([]);
    //table state
    const [columnFilters, setColumnFilters] = useState(props.columnFilters ?? []);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState(props.initialSortColumn ? [{"id":props.initialSortColumn,"desc":true}] : []);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        if (props.ws) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        columnFilters,
        globalFilter,
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
    ]);

    const fetchData = async () => {
        if (!data.length) {
            setIsLoading(true);
        } else {
            setIsRefetching(true);
        }

        let searchParams = "start=" + pagination.pageIndex;
        searchParams += "&size=" + pagination.pageSize;
        searchParams += "&filters=" + encodeURI(JSON.stringify(columnFilters ?? []));
        searchParams += "&globalFilter=" + globalFilter ?? '';
        searchParams += '&sorting=' + encodeURI(JSON.stringify(sorting ?? []));

        getJson (props.ws + "?" + searchParams).then ( (json) => {
            setData(json.data.data.objects);
            setRowCount(json.data.data.totalItems);
            setIsError(false);
            setIsLoading(false);
            setIsRefetching(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setIsError(true);
                setErrorMessage(error.response.data.message);
                setIsLoading(false);
                setIsRefetching(false);
                return;
            } else {
                setIsRefetching(false);
                setIsLoading(false);
                axiosError(error, null, props.setAlertDialogInput);
                return;
            }
        });
    };

    const getDescription = desc => {
        return desc.length > 150 && !descOpen ? `${desc.substring(0, 100)}...` : descOpen ? `${desc}` : desc;
    };

    const getUserName = user => {
        return user.firstName ? user.firstName + (user.lastName ? " " + user.lastName : "") : user.username;
    }

    const getDateCreated = dateCreated => {
        const d = new Date(dateCreated);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
        return `${month}/${day}/${year}`;
      }

    const columns = useMemo(
        () => [
          {
            header: 'List of Datasets',
            Header: ({ column }) => (
                <span>{column.columnDef.header} ({rowCount})</span> 
            ),
            enableColumnFilter: false,
            enableSorting: false,
            Cell: ({ row, index }) => (
            <div key={index} style={{ textAlign: "left", margin: "20px" }}>
                <div>
                    <strong>ID:</strong> <Link to={`/data/dataset/${row.original.datasetIdentifier}`}>{row.original.datasetIdentifier}</Link>
                </div>
                <div>
                    <strong>Dataset Name: </strong>
                    {row.original.name}
                </div>
                {row.original.description && <div style={{whiteSpace: "normal"}}>
                    <strong>Dataset Description: </strong>
                    {getDescription(row.original.description)}
                    <button className={"more-less"} onClick={() => setDescOpen(!descOpen)}>
                        {row.original.description.length > 150 && !descOpen ? `more` : descOpen ? `less` : ``}
                    </button>
                </div>}
                <div>
                    <strong>Submitter:</strong> &nbsp;
                    <span>
                        {getUserName(row.original.user)}
                    </span>
                </div>

                <div>
                    <span>
                        <strong>Public since:</strong> {getDateCreated(row.original.dateCreated)}
                    </span>
                </div>

                <div>
                    <span>
                        <strong>License:</strong> {row.original.license.name}
                    </span>
                </div>
            </div>
            ),
          },
        ],
        [descOpen],
    );

    const table = useMaterialReactTable({
        columns,
        data : data,
        getRowId: (row) => row["datasetId"],
        manualFiltering:  true,
        manualPagination: true,
        manualSorting: true,
        initialState: {
            showColumnFilters: false,
        },
        muiToolbarAlertBannerProps: isError
          ? {
              color: 'error',
              children: 
                <div>
                <Row>Error loading data</Row>
                <Row>{errorMessage}</Row>
              </div>,
            }
          : undefined,
          renderToolbarInternalActions: ({ table }) => (
            <Box>
              <MRT_ToggleGlobalFilterButton table={table} />
              <MRT_ToggleDensePaddingButton table={table} />
              <MRT_ToggleFullScreenButton table={table} />
            </Box>
          ),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        rowCount,
        state: {
            columnFilters,
            globalFilter,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isRefetching,
            sorting,
        },
    });

    return (
        <>
            <MaterialReactTable table={table} />
        </>
    );
}

export {DatasetTable};


