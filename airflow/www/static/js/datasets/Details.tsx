/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useMemo, useState } from 'react';
import {
  Box, Heading, Text, Code, Flex, Spinner, Button,
} from '@chakra-ui/react';
import { snakeCase } from 'lodash';
import type { SortingRule } from 'react-table';

import Time from 'src/components/Time';
import { useDatasetEvents, useDataset } from 'src/api';
import {
  Table, TimeCell, CodeCell, TaskInstanceLink,
} from 'src/components/Table';
import { ClipboardButton } from 'src/components/Clipboard';

interface Props {
  datasetId: string;
  onBack: () => void;
}

const DatasetDetails = ({ datasetId, onBack }: Props) => {
  const limit = 25;
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<SortingRule<object>[]>([{ id: 'timestamp', desc: true }]);

  const sort = sortBy[0];
  const order = sort ? `${sort.desc ? '-' : ''}${snakeCase(sort.id)}` : '';

  const { data: dataset, isLoading } = useDataset({ datasetId });
  const {
    data: { datasetEvents, totalEntries },
    isLoading: isEventsLoading,
  } = useDatasetEvents({
    datasetId, limit, offset, order,
  });

  const columns = useMemo(
    () => [
      {
        Header: 'Source Task Instance',
        accessor: 'sourceTaskId',
        Cell: TaskInstanceLink,
      },
      {
        Header: 'Extra',
        accessor: 'extra',
        disableSortBy: true,
        Cell: CodeCell,
      },
      {
        Header: 'When',
        accessor: 'timestamp',
        Cell: TimeCell,
      },
    ],
    [],
  );

  const data = useMemo(
    () => datasetEvents,
    [datasetEvents],
  );

  const memoSort = useMemo(() => sortBy, [sortBy]);

  return (
    <Box mt={[6, 3]} maxWidth="1500px">
      <Button onClick={onBack}>See all datasets</Button>
      {isLoading && <Spinner display="block" />}
      {!!dataset && (
        <Box>
          <Heading my={2} fontWeight="normal">
            Dataset:
            {' '}
            {dataset.uri}
            <ClipboardButton value={dataset.uri} iconOnly ml={2} />
          </Heading>
          {!!dataset.extra && (
            <Flex>
              <Text mr={1}>Extra:</Text>
              <Code>{JSON.stringify(dataset.extra)}</Code>
            </Flex>
          )}
          <Flex my={2}>
            <Text mr={1}>Updated At:</Text>
            <Time dateTime={dataset.updatedAt} />
          </Flex>
          <Flex my={2}>
            <Text mr={1}>Created At:</Text>
            <Time dateTime={dataset.createdAt} />
          </Flex>
        </Box>
      )}
      <Heading size="lg" mt={3} mb={2} fontWeight="normal">Upstream Events</Heading>
      <Text>Whenever a DAG has updated this dataset.</Text>
      <Table
        data={data}
        columns={columns}
        manualPagination={{
          offset,
          setOffset,
          totalEntries,
        }}
        manualSort={{
          setSortBy,
          sortBy,
          initialSortBy: memoSort,
        }}
        pageSize={limit}
        isLoading={isEventsLoading}
      />
    </Box>
  );
};

export default DatasetDetails;
