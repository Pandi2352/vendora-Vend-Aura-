import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { DataTable, RowActions, type Column, type RowAction } from '@/components/tables';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/api';
import type { MasterRecord } from './data/types';
import { StatusBadge } from './StatusBadge';

interface MasterListViewProps<T extends MasterRecord> {
  /** Singular name, e.g. "location" (used in buttons and messages). */
  noun: string;
  description: string;
  rows: T[];
  columns: Column<T>[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  searchText: (row: T) => string;
  searchPlaceholder: string;
  /** Label for delete confirmations, e.g. the record's code. */
  rowLabel: (row: T) => string;
  onAdd: () => void;
  onEdit: (row: T) => void;
  /** Omit when records cannot be deleted. Return a reason string to block deletion. */
  onDelete?: (row: T) => Promise<unknown>;
  canDelete?: (row: T) => string | null;
}

/**
 * Standard Master list: heading with an Add button, then the shared DataTable
 * with the screen's columns plus Status and Edit / Delete actions.
 */
export function MasterListView<T extends MasterRecord>({
  noun,
  description,
  rows,
  columns,
  loading,
  error,
  onRetry,
  searchText,
  searchPlaceholder,
  rowLabel,
  onAdd,
  onEdit,
  onDelete,
  canDelete,
}: MasterListViewProps<T>) {
  const confirm = useConfirm();
  const toast = useToast();

  const deleteRow = async (row: T) => {
    const blocked = canDelete?.(row);
    if (blocked) return toast.warning(`Cannot delete ${rowLabel(row)}`, blocked);
    const ok = await confirm({
      title: `Delete ${noun} ${rowLabel(row)}?`,
      message: 'This cannot be undone.',
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok || !onDelete) return;
    try {
      await onDelete(row);
      toast.success(`${capital(noun)} deleted`, rowLabel(row));
    } catch (err) {
      toast.error(`Could not delete ${noun}`, getErrorMessage(err));
    }
  };

  const allColumns: Column<T>[] = [
    ...columns,
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      sortValue: (r) => (r.active ? 0 : 1),
      render: (r) => <StatusBadge active={r.active} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => {
        const actions: RowAction[] = [
          { label: `Edit ${rowLabel(row)}`, icon: <PencilSimple />, tone: 'primary', onClick: () => onEdit(row) },
        ];
        if (onDelete)
          actions.push({
            label: `Delete ${rowLabel(row)}`,
            icon: <Trash />,
            tone: 'danger',
            onClick: () => void deleteRow(row),
          });
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <section className="space-y-3" aria-label={`${capital(noun)} list`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">{description}</p>
        <Button size="sm" icon={<Plus weight="bold" className="w-3.5 h-3.5" />} onClick={onAdd}>
          Add {noun}
        </Button>
      </div>
      <DataTable
        rows={rows}
        columns={allColumns}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={onRetry}
        searchText={searchText}
        searchPlaceholder={searchPlaceholder}
        emptyTitle={`No ${noun}s yet`}
        emptyDescription={`Use “Add ${noun}” to create the first one.`}
        onRowClick={onEdit}
      />
    </section>
  );
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
