import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormState, UseFormReset, UseFormSetValue } from 'react-hook-form';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import Toggle from './Toggle';
import Tooltip from './Tooltip';
import { AVAILABLE_EXPLORER } from '../contexts/preferredExplorer/index';
import { IFormConfigurator, INITIAL_FORM_CONFIG } from 'src/constants';
import { useRouter } from 'next/router';
import { base64ToJson } from 'src/misc/utils';
import { cn } from 'src/misc/cn';

const templateOptions: { name: string; description: string; values: IFormConfigurator }[] = [
  {
    name: 'Default',
    description: 'Full functionality and swap experience of Terminal.',
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: { ...INITIAL_FORM_CONFIG.formProps },
    },
  },
  {
    name: 'APE',
    description: `
    APE. Just APE.
    `,
    values: {
      ...INITIAL_FORM_CONFIG,
      strictTokenList: false,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        initialAmount: '8888888800000',
        fixedAmount: false,
        initialInputMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        fixedInputMint: false,
        initialOutputMint: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR',
        fixedOutputMint: true,
      },
    },
  },
];

const FormConfigurator = ({
  simulateWalletPassthrough,
  strictTokenList,
  defaultExplorer,
  formProps,
  refetchIntervalForTokenAccounts,
  // Hook form
  reset,
  setValue,
  formState,
}: IFormConfigurator & {
  // Hook form
  reset: UseFormReset<IFormConfigurator>;
  setValue: UseFormSetValue<IFormConfigurator>;
  formState: FormState<IFormConfigurator>;
}) => {
  const currentTemplate = useRef('');
  const { query, replace } = useRouter();

  const [isImported, setIsImported] = useState(false);

  const onSelect = useCallback(
    (index: number) => {
      reset(templateOptions[index].values);

      const templateName = templateOptions[index].name;
      currentTemplate.current = templateName;

      console.log('templateName', templateName);
      replace(
        {
          query:
            templateName === 'Default'
              ? undefined
              : {
                  template: templateName,
                },
        },
        undefined,
        { shallow: true },
      );

      setActive(index);
      setIsOpen(false);
    },
    [replace, reset],
  );

  // Initial pre-populate
  const prepopulated = useRef(false);
  useEffect(() => {
    const templateString = query?.import;
    if (templateString) {
      const data = base64ToJson(templateString as string);

      if (!data) {
        replace({ query: undefined });
        return;
      }

      reset({
        ...formState.defaultValues,
        ...data,
      });
      setIsImported(true);
      return;
    }

    const templateName = query?.template;
    if (currentTemplate.current === templateName) return;

    const foundIndex = templateOptions.findIndex((item) => item.name === templateName);
    if (foundIndex >= 0 && !prepopulated.current) {
      prepopulated.current = true;
      onSelect(foundIndex);
    }
  }, [formState.defaultValues, onSelect, query, replace, reset]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [isExplorerDropdownOpen, setIsExplorerDropdownOpen] = React.useState(false);

  return (
    <div className="w-full max-w-full border border-white/10 md:border-none md:mx-0 md:max-w-[340px] max-h-[700px] overflow-y-scroll overflow-x-hidden webkit-scrollbar bg-white/5 rounded-xl p-4">
      <div className="w-full">
        <div className="relative inline-block text-left text-white w-full">
          <p className="text-white text-sm font-semibold">Template</p>

          <div className="mt-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
              id="menu-button"
              aria-expanded="true"
              aria-haspopup="true"
            >
              <div className="flex items-center justify-center space-x-2.5">
                <p>{isImported ? `Imported` : templateOptions[active].name}</p>

                <Tooltip
                  variant="dark"
                  content={<div className="text-white text-xs">{templateOptions[active].description}</div>}
                >
                  <div className="flex items-center text-white-35 fill-current">
                    <InfoIconSVG width={12} height={12} />
                  </div>
                </Tooltip>

                {formState?.isDirty ? (
                  <p className="text-[10px] text-white/50 rounded-xl py-1 px-2 border border-white/50 leading-none">
                    Custom
                  </p>
                ) : null}
              </div>

              <ChevronDownIcon />
            </button>

            {isOpen ? (
              <div
                className="absolute left-0 z-10 ml-1 mt-1 origin-top-right rounded-md shadow-xl bg-zinc-700 w-full border border-white/20"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
              >
                {templateOptions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(index)}
                    type="button"
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm hover:bg-white/20 text-left',
                      active === index ? '' : '',
                      index !== templateOptions.length - 1 ? 'border-b border-white/10' : '',
                    )}
                  >
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-white mt-8 text-sm font-semibold">Things you can configure</p>

      {/* Fixed input */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed input mint</p>
          <p className="text-xs text-white/50">Input mint cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedInputMint}
          onClick={() => setValue('formProps.fixedInputMint', !formProps.fixedInputMint, { shouldDirty: true })}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Fixed output */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed output mint</p>
          <p className="text-xs text-white/50">Output mint cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedOutputMint}
          onClick={() => setValue('formProps.fixedOutputMint', !formProps.fixedOutputMint, { shouldDirty: true })}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Fixed amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed amount</p>
          <p className="text-xs text-white/50">Depending on Exact In / Exact Out, the amount cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedAmount}
          onClick={() => setValue('formProps.fixedAmount', !formProps.fixedAmount, { shouldDirty: true })}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Initial Amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Initial amount</p>
          <p className="text-xs text-white/50">Amount to be prefilled on first load</p>
        </div>
      </div>
      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
        value={formProps.initialAmount}
        inputMode="numeric"
        onChange={(e) => {
          const regex = /^[0-9\b]+$/;
          const value = e.target.value;
          if (value === '' || regex.test(value)) {
            setValue('formProps.initialAmount', value);
          }
        }}
      />
      <div className="w-full border-b border-white/10 py-3" />

      {/* Wallet passthrough */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Simulate wallet passthrough</p>
          <p className="text-xs text-white/50">Simulate Terminal with a fake wallet passthrough</p>
          <p className="text-xs text-white/50">(Testing available on Desktop only)</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={simulateWalletPassthrough}
          onClick={() => setValue('simulateWalletPassthrough', !simulateWalletPassthrough)}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Refetch interval for token accounts  */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Refetch interval for token accounts</p>
          <p className="text-xs text-white/50">{`Set the interval in milliseconds to refetch getTokenAccountsByOwner.`}</p>
        </div>
      </div>

      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10 placeholder:text-v2-lily/10"
        value={refetchIntervalForTokenAccounts}
        inputMode="numeric"
        placeholder="10000 (10s)"
        onChange={(e) => {
          const regex = /^[0-9\b]+$/;
          const value = e.target.value;
          if (value === '' || regex.test(value)) {
            setValue('refetchIntervalForTokenAccounts', Number(value));
          }
        }}
      />
      <div className="w-full border-b border-white/10 py-3" />

      {/* Preferred Explorer  */}
      <div className="relative inline-block text-left text-white w-full mt-5">
        <p className="text-white text-sm font-semibold">Preferred Explorer</p>

        <div className="mt-4">
          <button
            onClick={() => setIsExplorerDropdownOpen(!isExplorerDropdownOpen)}
            type="button"
            className="w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <div className="flex items-center justify-center space-x-2.5">
              <p>{Object.values(AVAILABLE_EXPLORER).find((item) => item.name === defaultExplorer)?.name}</p>
            </div>

            <ChevronDownIcon />
          </button>

          {isExplorerDropdownOpen ? (
            <div
              className="absolute left-0 bottom-6 z-10 ml-1 mt-1 origin-top-right rounded-md shadow-xl bg-zinc-700 w-full border border-white/20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              {AVAILABLE_EXPLORER.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue('defaultExplorer', item.name);
                    setIsExplorerDropdownOpen(false);
                  }}
                  type="button"
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-sm hover:bg-white/20 text-left',
                    active === index ? '' : '',
                    index !== AVAILABLE_EXPLORER.length - 1 ? 'border-b border-white/10' : '',
                  )}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FormConfigurator;
