import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchCsvJobs, resetCsvJobsState } from "lib/redux/fileManagementSlice"
import { CsvJobsParams } from "lib/redux/fileManagementSlice"

export const useCsvJobs = () => {
  const dispatch = useAppDispatch()
  const { csvJobs, csvJobsLoading, csvJobsError, csvJobsSuccess, csvJobsPagination } = useAppSelector(
    (state) => state.fileManagement
  )

  const fetchJobs = (params: CsvJobsParams) => {
    dispatch(fetchCsvJobs(params))
  }

  const resetState = () => {
    dispatch(resetCsvJobsState())
  }

  return {
    csvJobs,
    csvJobsLoading,
    csvJobsError,
    csvJobsSuccess,
    csvJobsPagination,
    fetchJobs,
    resetState,
  }
}

// Example component usage
export const CsvJobsExample = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { csvJobs, csvJobsLoading, csvJobsError, csvJobsSuccess, csvJobsPagination, fetchJobs, resetState } =
    useCsvJobs()

  useEffect(() => {
    // Fetch CSV jobs on component mount
    fetchJobs({
      PageNumber: currentPage,
      PageSize: pageSize,
    })

    return () => {
      resetState()
    }
  }, [currentPage])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleFilter = (filters: Partial<CsvJobsParams>) => {
    fetchJobs({
      PageNumber: 1,
      PageSize: pageSize,
      ...filters,
    })
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">CSV Jobs</h2>

      {csvJobsLoading && <div>Loading...</div>}
      {csvJobsError && <div className="text-red-500">Error: {csvJobsError}</div>}

      {csvJobsSuccess && (
        <div>
          <div className="mb-4">
            <p>Total Jobs: {csvJobsPagination?.totalCount || 0}</p>
            <p>
              Page: {csvJobsPagination?.currentPage || 0} of {csvJobsPagination?.totalPages || 0}
            </p>
          </div>

          {/* Filter controls */}
          <div className="mb-4 flex gap-2">
            <select
              onChange={(e) => handleFilter({ Status: e.target.value ? Number(e.target.value) : undefined })}
              className="rounded border px-2 py-1"
            >
              <option value="">All Statuses</option>
              <option value="1">Status 1</option>
              <option value="2">Status 2</option>
              <option value="3">Status 3</option>
              <option value="4">Status 4</option>
              <option value="5">Status 5</option>
            </select>

            <select
              onChange={(e) => handleFilter({ JobType: e.target.value ? Number(e.target.value) : undefined })}
              className="rounded border px-2 py-1"
            >
              <option value="">All Job Types</option>
              <option value="1">Job Type 1</option>
              <option value="2">Job Type 2</option>
              {/* Add more job types as needed */}
            </select>

            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => handleFilter({ Search: e.target.value })}
              className="rounded border px-2 py-1"
            />
          </div>

          {/* Jobs table */}
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">File Name</th>
                <th className="border p-2 text-left">Job Type</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Requested At</th>
                <th className="border p-2 text-left">Progress</th>
              </tr>
            </thead>
            <tbody>
              {csvJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="border p-2">{job.id}</td>
                  <td className="border p-2">{job.fileName}</td>
                  <td className="border p-2">{job.jobType}</td>
                  <td className="border p-2">{job.status}</td>
                  <td className="border p-2">{new Date(job.requestedAtUtc).toLocaleString()}</td>
                  <td className="border p-2">
                    {job.totalRows > 0
                      ? `${job.processedRows}/${job.totalRows} (${Math.round(
                          (job.processedRows / job.totalRows) * 100
                        )}%)`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {csvJobsPagination && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!csvJobsPagination.hasPrevious}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {csvJobsPagination.currentPage} of {csvJobsPagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!csvJobsPagination.hasNext}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
