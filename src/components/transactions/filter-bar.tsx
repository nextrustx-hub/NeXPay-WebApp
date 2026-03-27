'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TransactionType, TransactionStatus } from '@/lib/api-types';

export interface TransactionFilters {
  type: 'all' | TransactionType;
  status: 'all' | TransactionStatus;
  from?: Date;
  to?: Date;
  search: string;
}

interface FilterBarProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClear: () => void;
}

export function FilterBar({ filters, onFiltersChange, onClear }: FilterBarProps) {
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');

  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.status !== 'all' || 
    filters.from || 
    filters.to || 
    filters.search;

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value as TransactionFilters['type'],
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as TransactionFilters['status'],
    });
  };

  const handleFromDateSelect = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      from: date,
    });
  };

  const handleToDateSelect = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      to: date,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">
            {tCommon('filter')}:
          </span>
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 justify-start text-left font-normal",
                !filters.from && !filters.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.from ? (
                filters.to ? (
                  <>
                    {format(filters.from, 'dd/MM/yy', { locale: ptBR })} - {format(filters.to, 'dd/MM/yy', { locale: ptBR })}
                  </>
                ) : (
                  format(filters.from, 'dd/MM/yy', { locale: ptBR })
                )
              ) : (
                <span>{t('dateRange')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.from}
              selected={{
                from: filters.from,
                to: filters.to,
              }}
              onSelect={(range) => {
                handleFromDateSelect(range?.from);
                handleToDateSelect(range?.to);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Type Filter */}
        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder={t('allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            <SelectItem value="deposit">{t('type.deposit')}</SelectItem>
            <SelectItem value="withdraw">{t('type.withdraw')}</SelectItem>
            <SelectItem value="pix_received">{t('type.pix_received')}</SelectItem>
            <SelectItem value="pix_sent">{t('type.pix_sent')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder={t('allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="completed">{t('status.completed')}</SelectItem>
            <SelectItem value="pending">{t('status.pending')}</SelectItem>
            <SelectItem value="processing">{t('status.processing')}</SelectItem>
            <SelectItem value="failed">{t('status.failed')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou descrição..."
            value={filters.search}
            onChange={handleSearchChange}
            className="h-9 pl-9"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-9 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {t(`type.${filters.type}`)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTypeChange('all')}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {t(`status.${filters.status}`)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleStatusChange('all')}
              />
            </Badge>
          )}
          {filters.from && (
            <Badge variant="secondary" className="gap-1">
              De: {format(filters.from, 'dd/MM/yy', { locale: ptBR })}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFromDateSelect(undefined)}
              />
            </Badge>
          )}
          {filters.to && (
            <Badge variant="secondary" className="gap-1">
              Até: {format(filters.to, 'dd/MM/yy', { locale: ptBR })}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleToDateSelect(undefined)}
              />
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, search: '' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
