module TestTranslations exposing (..)

import Expect exposing (Expectation)
import I18Next
import Json.Decode as JD
import Test exposing (..)
import Translations
import Translations.Greetings


suite : Test
suite =
    describe "Translations"
        [ test "Handles message with no placeholder in top-level module" <|
            runTest """{"hello": "Hello"}""" "Hello" Translations.hello
        , test "Handles message with no placeholder in nested module" <|
            runTest """{"greetings": {"goodDay": "Good day."}}""" "Good day." Translations.Greetings.goodDay
        , test "Handles message with placeholders in top-level module" <|
            runTest """{"helloWithParams": "Hello {{firstname}} {{middlename}} {{lastname}}!"}"""
                "Hello Joe Bob Bloggs!"
                (\translations -> Translations.helloWithParams translations "Joe" "Bob" "Bloggs")
        , test "Handles message with placeholders in nested module" <|
            runTest """{"greetings": {"greetName": "Hi {{name}}"}}"""
                "Hi Peter"
                (\translations -> Translations.Greetings.greetName translations "Peter")
        ]


runTest : String -> String -> (I18Next.Translations -> String) -> (() -> Expectation)
runTest json expected translationFn =
    \_ -> Expect.equal expected (translationFn (jsonToTranslations json))


jsonToTranslations : String -> I18Next.Translations
jsonToTranslations json =
    JD.decodeString I18Next.translationsDecoder json
        |> Result.withDefault I18Next.initialTranslations
