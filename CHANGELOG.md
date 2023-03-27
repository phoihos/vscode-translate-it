# Change Log

All notable changes to the "Translate it" extension will be documented in this file.

## [1.9.0] - 2023-03-27

- Added : New `Bing Translator` feature
  - Now, supports two translation api `Google` and `Bing`
  - See `translateIt.api` configuration

## [1.8.2] - 2022-01-21

- Updated : Internal dependencies

## [1.8.1] - 2021-08-21

- Fixed : `Translate it` command does not work from the context menu

## [1.8.0] - 2021-08-18

- Refactored : Bundle the extension to reduce the size

## [1.7.4] - 2021-07-21

- Updated : The horizontal rule in the **Output Channel** has correctly width even if the header contains CJK (Chinese/Japanese/Korean) characters

## [1.7.3] - 2021-06-11

- Updated : Internal dependencies to solve security vulnerabilities

## [1.7.2] - 2021-05-07

- Updated : Internal dependencies to solve security vulnerabilities

## [1.7.1] - 2021-04-01

- Updated : Internal dependencies
- Fixed : Security update (update some packages)

## [1.7.0] - 2020-12-23

- Refactored : Changed all command functions to command classes
- Refactored : Changed all event listener functions to event listener classes

## [1.6.0] - 2020-11-11

- Updated : Changed internal Google Translate API calling

## [1.5.1] - 2020-11-11

- Fixed : `403 Forbidden` issue

## [1.5.0] - 2020-10-16

- Added : `Remove Translation Highlighting` Command (Context Menu support)
- Updated : Change the color of translation highlighting
- Fixed : Not changed hover message after changing target language from on hover

## [1.4.0] - 2020-10-13

- Change project repository url
- Update README

## [1.3.0] - 2020-10-02

- Updated : Displays more details of progress in the notification
- Updated : Increases accuracy of automatic detecting user's prefer display language
- Updated : README

## [1.2.2] - 2020-09-30

- Fixed : Always translating a whole line text even though select a word
- Fixed : Does not display hover when selected last line is empty

## [1.2.0] - 2020-09-30

- Added : Fitting the selection ranges for parsed comments only
- Added : Changing target language on hover display and re-translating
- Fixed : Translated result does not remove whitespace characters
- Fixed : Output Channel always showing
- Updated : README

## [1.0.0] - 2020-09-27

- Initial release
