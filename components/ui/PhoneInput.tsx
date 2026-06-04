import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const en = require('react-phone-number-input/locale/en') as Record<
  string,
  string
>;

const toFlag = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

const ALL_COUNTRIES: CountryOption[] = getCountries()
  .reduce<CountryOption[]>((acc, code) => {
    try {
      acc.push({
        code,
        name: en[code] ?? code,
        dialCode: `+${getCountryCallingCode(code)}`,
        flag: toFlag(code),
      });
    } catch {
      // skip countries without a calling code
    }
    return acc;
  }, [])
  .sort((a, b) => a.name.localeCompare(b.name));

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  defaultCountry?: string;
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  placeholder = 'Enter phone number',
  defaultCountry = 'NP',
}) => {
  const initial =
    ALL_COUNTRIES.find((c) => c.code === defaultCountry) ?? ALL_COUNTRIES[0];

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [country, setCountry] = React.useState<CountryOption>(initial);
  const [digits, setDigits] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!search.trim()) return ALL_COUNTRIES;
    const q = search.toLowerCase();
    return ALL_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q),
    );
  }, [search]);

  const selectCountry = (c: CountryOption) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    onChange(`${c.dialCode}${digits}`);
  };

  const handleDigits = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setDigits(cleaned);
    onChange(`${country.dialCode}${cleaned}`);
  };

  return (
    <View>
      {/* ── Input row ── */}
      <View style={[s.row, error ? s.rowError : null]}>
        <TouchableOpacity
          style={[s.dialBtn, open && s.dialBtnActive]}
          onPress={() => {
            setSearch('');
            setOpen((o) => !o);
          }}
          activeOpacity={0.7}
        >
          <Text style={s.flag}>{country.flag}</Text>
          <Text style={s.dialCode}>{country.dialCode}</Text>
          <Text style={s.chevron}>{open ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        <TextInput
          style={s.input}
          value={digits}
          onChangeText={handleDigits}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          onFocus={() => open && setOpen(false)}
        />
      </View>

      {/* ── Inline dropdown ── */}
      {open && (
        <View style={s.dropdown}>
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search country or code…"
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            style={s.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  s.option,
                  item.code === country.code && s.optionActive,
                ]}
                onPress={() => selectCountry(item)}
                activeOpacity={0.7}
              >
                <Text style={s.optionFlag}>{item.flag}</Text>
                <Text style={s.optionName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={s.optionDial}>{item.dialCode}</Text>
                {item.code === country.code && (
                  <Text style={s.check}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  rowError: {
    borderColor: '#DC2626',
  },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: 80,
  },
  dialBtnActive: {
    backgroundColor: '#EFF6FF',
    borderRightColor: '#93C5FD',
  },
  flag: {
    fontSize: 18,
  },
  dialCode: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  chevron: {
    fontSize: 9,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontFamily: 'Manrope',
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    maxHeight: 280,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Manrope',
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  list: {
    maxHeight: 230,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 10,
  },
  optionActive: {
    backgroundColor: '#EFF6FF',
  },
  optionFlag: {
    fontSize: 20,
  },
  optionName: {
    flex: 1,
    fontFamily: 'Manrope',
    fontSize: 14,
    color: '#111827',
  },
  optionDial: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  check: {
    fontSize: 14,
    color: '#1A56DB',
    fontWeight: '700',
  },
});
