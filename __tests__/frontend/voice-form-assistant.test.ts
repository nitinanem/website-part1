import { describe, it, expect } from 'vitest'
import {
  parseAge,
  parseGender,
  parseName,
  parsePhone,
  parseYesNo,
  parseCommand,
} from '@/lib/voice/voice-form-parser'

describe('lib/voice/voice-form-parser (Multilingual Elderly Voice Parsing)', () => {
  describe('parseAge', () => {
    it('extracts direct numerals from speech', () => {
      expect(parseAge('65')).toBe(65)
      expect(parseAge('मेरी उम्र 70 साल है')).toBe(70)
      expect(parseAge('i am 68 years old')).toBe(68)
      expect(parseAge('around 55')).toBe(55)
    })

    it('extracts Hindi number words for seniors', () => {
      expect(parseAge('पैंसठ')).toBe(65)
      expect(parseAge('साठ साल')).toBe(60)
      expect(parseAge('सत्तर वर्ष')).toBe(70)
      expect(parseAge('उम्र बहत्तर है')).toBe(72)
      expect(parseAge('अस्सी साल के हैं हम')).toBe(80)
      expect(parseAge('पचपन')).toBe(55)
    })

    it('extracts English number words', () => {
      expect(parseAge('sixty five')).toBe(65)
      expect(parseAge('seventy two')).toBe(72)
      expect(parseAge('eighty')).toBe(80)
    })

    it('ignores invalid or non-age numbers', () => {
      expect(parseAge('कोई दर्द नहीं')).toBeNull()
      expect(parseAge('hello doctor')).toBeNull()
    })
  })

  describe('parseGender', () => {
    it('identifies male in Hindi and English', () => {
      expect(parseGender('पुरुष')).toBe('male')
      expect(parseGender('हम पुरुष हैं')).toBe('male')
      expect(parseGender('आदमी')).toBe('male')
      expect(parseGender('male')).toBe('male')
      expect(parseGender('i am a man')).toBe('male')
    })

    it('identifies female in Hindi and English', () => {
      expect(parseGender('महिला')).toBe('female')
      expect(parseGender('स्त्री')).toBe('female')
      expect(parseGender('औरत')).toBe('female')
      expect(parseGender('female')).toBe('female')
      expect(parseGender('woman')).toBe('female')
    })

    it('identifies other', () => {
      expect(parseGender('अन्य')).toBe('other')
      expect(parseGender('other')).toBe('other')
    })
  })

  describe('parseYesNo', () => {
    it('identifies affirmative (Yes) answers', () => {
      expect(parseYesNo('हाँ')).toBe(true)
      expect(parseYesNo('हाँजी')).toBe(true)
      expect(parseYesNo('जी हाँ')).toBe(true)
      expect(parseYesNo('हाँ बहुत दर्द होता है')).toBe(true)
      expect(parseYesNo('yes')).toBe(true)
      expect(parseYesNo('definitely')).toBe(true)
      expect(parseYesNo('हाँ जी बहुत अकड़न है')).toBe(true)
    })

    it('identifies negative (No) answers', () => {
      expect(parseYesNo('नहीं')).toBe(false)
      expect(parseYesNo('ना')).toBe(false)
      expect(parseYesNo('नहीं जी')).toBe(false)
      expect(parseYesNo('बिल्कुल नहीं')).toBe(false)
      expect(parseYesNo('no')).toBe(false)
      expect(parseYesNo('never')).toBe(false)
      expect(parseYesNo('नहीं होता')).toBe(false)
    })
  })

  describe('parseName', () => {
    it('extracts name stripping conversational phrases', () => {
      expect(parseName('मेरा नाम राम अवतार है')).toBe('राम अवतार')
      expect(parseName('हमारा नाम रमेश शर्मा')).toBe('रमेश शर्मा')
      expect(parseName('my name is Suresh Patel')).toBe('Suresh Patel')
      expect(parseName('Sunita Devi')).toBe('Sunita Devi')
    })
  })

  describe('parsePhone', () => {
    it('extracts 10-digit phone number', () => {
      expect(parsePhone('9876543210')).toBe('9876543210')
      expect(parsePhone('मेरा नंबर 9876543210 है')).toBe('9876543210')
      expect(parsePhone('+919876543210')).toBe('9876543210')
      expect(parsePhone('12345')).toBeNull()
    })
  })

  describe('parseCommand', () => {
    it('identifies navigation and voice control commands', () => {
      expect(parseCommand('अगला सवाल')).toBe('next')
      expect(parseCommand('next please')).toBe('next')
      expect(parseCommand('पीछे जाओ')).toBe('prev')
      expect(parseCommand('go back')).toBe('prev')
      expect(parseCommand('दोबारा बोलो')).toBe('repeat')
      expect(parseCommand('फिर से बताइए')).toBe('repeat')
      expect(parseCommand('repeat question')).toBe('repeat')
      expect(parseCommand('फॉर्म जमा करो')).toBe('submit')
      expect(parseCommand('submit form')).toBe('submit')
      expect(parseCommand('रुक जाओ')).toBe('stop')
    })
  })
})
