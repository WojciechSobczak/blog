import argparse
import subprocess
import os
import configparser
import json

SCRIPT_FILE_DIR = os.path.realpath(os.path.dirname(__file__)).replace('\\', '/')
CONAN_HOME_ENV = f'{SCRIPT_FILE_DIR}/.conan'
PROFILES_PATH = f'{CONAN_HOME_ENV}/profiles'

def execute_command(command: list[str]):
    env = os.environ.copy()
    env['CONAN_HOME'] = CONAN_HOME_ENV
    print(f"Executing: {' '.join(command)}")
    process = subprocess.run(args=command, env=env, cwd = SCRIPT_FILE_DIR)
    if process.returncode != 0:
        raise Exception(f"Expected return code: 0 is different from actual: {process.returncode}")

def get_toolchain_file(mode: str):
    return f'{CONAN_HOME_ENV}/build-{mode}/conan_toolchain.cmake'

def create_profiles(conan_path: str):
    execute_command([
        conan_path,
        'profile',
        'detect',
        '--force'
    ])

    config = configparser.ConfigParser()
    config.read(f'{PROFILES_PATH}/default')

    config['settings']['build_type'] = "Release"
    config['settings']['compiler.cppstd'] = "20"
    with open(f'{PROFILES_PATH}/release', "w") as file:
        config.write(file)

    config['settings']['build_type'] = "Debug"
    with open(f'{PROFILES_PATH}/debug', "w", encoding="UTF-8") as file:
        config.write(file)
    
def install_dependencies(conan_path: str):
    for mode in ['debug', 'release']:
        execute_command([
            conan_path, 
            f'install', 
            f'.', 
            f'--output-folder={CONAN_HOME_ENV}/build-{mode}',
            f'--build=missing',
            f'--profile={mode}'
        ])

    presets_file = f'{SCRIPT_FILE_DIR}/CMakeUserPresets.json'
    os.remove(presets_file)

def adjust_visual_studio():
    vs_cmake_settings_file = f'{SCRIPT_FILE_DIR}/CMakeSettings.json'
    with open(vs_cmake_settings_file, "r", encoding="utf-8-sig") as file:
        json_file_config = json.loads(file.read())

    configurations = json_file_config['configurations']

    for config in configurations:
        for mode in ['debug', 'release']:
            config_type: str = config['configurationType']
            if config_type.lower() == mode:
                toolchain_file = get_toolchain_file(mode)
                config['cmakeToolchain'] = toolchain_file.replace(SCRIPT_FILE_DIR, '${projectDir}')

                with open(toolchain_file, "r", encoding="utf-8-sig") as file:
                    toolchain_file_text = file.read()
                toolchain_file_text = toolchain_file_text.replace('set(CMAKE_GENERATOR_PLATFORM', '#')
                toolchain_file_text = toolchain_file_text.replace('set(CMAKE_GENERATOR_TOOLSET', '#')

                with open(toolchain_file, "w", encoding="utf-8") as file:
                    file.write(toolchain_file_text)

        config["buildRoot"] = '${projectDir}/.vs/out/build/${name}'
        config["installRoot"] = '${projectDir}/.vs/install/${name}'

    with open(vs_cmake_settings_file, "w", encoding="UTF-8") as file:
        file.write(json.dumps(json_file_config, indent=4))

def print_cmake_commands():
    for mode in ['debug', 'release']:
        command = [
            f'mkdir build',
            f'cd build',
            f'cmake .. -DCMAKE_TOOLCHAIN_FILE="{get_toolchain_file(mode)}"',
            f'cmake --build . --config {mode.capitalize()}',
            f'cd ..',
            f'rm -rf build'
        ]
        print(' && '.join(command))

def main():
    parser = argparse.ArgumentParser(description='Conan 2.0 CMake setup script')
    parser.add_argument('--conan-path', type=str, default="conan", help='Custom path to conan executable')
    parser.add_argument('-c', '--commands', action="store_true", help='Print of cmake build commands')
    parser.add_argument('-v', '--vs', action="store_true", help='Adjust Visual Studio Files')
    parser.add_argument('-p', '--profiles', action="store_true", help='Crate Conan Profiles')
    parser.add_argument('-d', '--dependencies', action="store_true", help='Download conan dependencies')
    args = parser.parse_args()

    if not args.profiles and not args.dependencies and not args.vs and not args.commands:
        args.profiles = True
        args.dependencies = True
        args.vs = True
        args.commands = True
    
    if args.profiles:
        create_profiles(args.conan_path)
    if args.dependencies:
        install_dependencies(args.conan_path)
    if args.vs:
        adjust_visual_studio()
    if args.commands:
        print_cmake_commands()

if __name__ == "__main__":
    main()
