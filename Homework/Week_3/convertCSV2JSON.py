# Convert CSV into json
# Lucas Lumeij
#
# This script takes a CSV input file and JSON target file and converts the CSV data
# into JSON data.

import sys
import getopt
import csv
import json

def main(argv):
    """Checks input in command line and calls read function."""

    # get options from command line, explain usage when failed
    try:
        opts, args = getopt.getopt(argv, "hi:o:", ["ifile=", "ofile="])
    except getopt.GetoptError:
        print('Usage: convertCSV2JSON.py -i <inputfile path> -o <outputfile path>')
        sys.exit(2)

    # takes input arguments and turn into values (or explain usage when help)
    for opt, arg in opts:
        if opt == '-h':
            print('Usage: convertCSV2JSON.py -i <inputfile path> -o <outputfile path>')
            sys.exit()
        elif opt in ("-i", "--ifile"):
            input_file = arg
        elif opt in ("-o", "--ofile"):
            output_file = arg

    # puts files in read function
    read_csv(input_file, output_file)

def read_csv(csv_file, json_file):
    """Reads data from CSV and convert into prop JSON format."""

    # create empty array for CSV elements
    csv_rows = []

    # open CSV file
    with open(csv_file) as file:
        reader = csv.DictReader(file)
        title = reader.fieldnames

        # put each of CSV in array (with proper JSON format)
        for row in reader:
            csv_rows.extend([{title[i]:row[title[i]] for i in range(len(title))}])

        # ensure that array is in an object
        write_input = {"data": csv_rows}

        # call JSON write function
        write_json(write_input, json_file)

def write_json(data, json_file):
    """Write JSON formatted data to JSON file."""

    with open(json_file, "w") as f:
        f.write(json.dumps(data))

if __name__ == "__main__":
    main(sys.argv[1:])
