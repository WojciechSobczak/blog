cmake_minimum_required(VERSION 3.21)
project(blog_cpp)
set(CMAKE_CXX_STANDARD 20)

find_package(fmt REQUIRED)

add_executable(${PROJECT_NAME} 
    "src/main.cpp"
)

target_link_libraries(${PROJECT_NAME} fmt::fmt)