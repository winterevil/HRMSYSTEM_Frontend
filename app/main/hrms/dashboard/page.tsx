import React from 'react';

export default function DashboardPage() {
    return (
        <div className="section-body">
            <div className="container-fluid">
                <div className="row clearfix">
                    <div className="col-lg-12">
                        <div className="mb-4">
                            <h4 className="font600 mb-1">Welcome Jason Porter!</h4>
                            <small>Measure How Fast {"You're"} Growing Monthly Recurring Revenue. <a href="#">Learn More</a></small>
                        </div>
                    </div>
                </div>
                <div className="row clearfix">
                    <div className="col-md-4">
                        <div className="card ribbon">
                            <a href="/main/hrms/employee" className="card-body my_sort_cut">
                                <i className="fa-solid fa-users"></i>
                                <h6 className="pt-2 mb-0 font500">Employees</h6>
                            </a>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card">
                            <a href="/main/hrms/employee-type" className="card-body my_sort_cut">
                                <i className="fa-solid fa-user-tie"></i>
                                <h6 className="pt-2 mb-0 font500">Types</h6>
                            </a>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card">
                            <a href="/main/hrms/department" className="card-body my_sort_cut">
                                <i className="fa-solid fa-tags"></i>
                                <h6 className="pt-2 mb-0 font500">Departments</h6>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="row clearfix row-deck">
                    <div className="col-xl-9 col-12">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Salary Statistics</h3>
                                <div className="card-options">
                                    <a href="#" className="card-options-collapse" data-toggle="card-collapse"><i className="fa-solid fa-chevron-up"></i></a>
                                    <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fa-solid fa-maximize"></i></a>
                                    <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                    <div className="item-action dropdown ml-2">
                                        <a href="javascript:void(0)" data-toggle="dropdown"><i className="fa-solid fa-ellipsis-vertical"></i></a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-eye"></i> View Details </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-share-alt"></i> Share </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-cloud-download"></i> Download</a>
                                            <div className="dropdown-divider"></div>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-copy"></i> Copy to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-folder"></i> Move to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-edit"></i> Rename</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-trash"></i> Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body pb-0">
                                <div id="chart-bar-theme1" style={{ height: "350px" }} ></div>
                            </div>
                            <div className="card-footer">
                                <div className="d-flex justify-content-between align-items-center">
                                    <a href="javascript:void(0)" className="btn btn-info btn-sm w200 mr-3">Generate Report</a>
                                    <small>Measure How Fast You re Growing Monthly Recurring Revenue. <a href="#">Learn More</a></small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">My Balance</h3>
                                <div className="card-options">
                                    <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fa-solid fa-maximize"></i></a>
                                    <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                </div>
                            </div>
                            <div className="card-body">
                                <span>Balance</span>
                                <h4 className="font600">$<span className="counter">20,508</span></h4>
                                <div id="theme-apexspark1" className="mb-4"></div>
                                <div className="form-group">
                                    <label className="d-block"><small className="text-muted">Bank of America</small><span className="float-right font700">$<span className="counter">15,025</span></span></label>
                                    <div className="progress" style={{ height: "5px" }} >
                                        <div className="progress-bar bg-azure" role="progressbar" aria-valuenow={77} aria-valuemin={0} aria-valuemax={100} style={{ width: "77%" }} ></div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="d-block"><small className="text-muted">RBC Bank</small><span className="float-right font700">$<span className="counter">1,843</span></span></label>
                                    <div className="progress" style={{ height: "5px" }}>
                                        <div className="progress-bar bg-green" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} style={{ width: "50%" }} ></div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="d-block"><small className="text-muted">Frost Bank</small><span className="float-right font700">$<span className="counter">3,641</span></span></label>
                                    <div className="progress" style={{ height: "5px" }}>
                                        <div className="progress" style={{ height: "5px" }}>
                                            <div className="progress-bar bg-blue" role="progressbar" aria-valuenow={23} aria-valuemin={0} aria-valuemax={100} style={{ width: "23%" }} ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <a href="javascript:void(0)" className="btn btn-block btn-info btn-sm">View More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Revenue</h3>
                                <div className="card-options">
                                    <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fa-solid fa-maximize"></i></a>
                                    <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                </div>
                            </div>
                            <div className="card-body text-center">
                                <div className="mt-3">
                                    <input type="text" className="knob" value="78" data-width="148" data-height="148" data-thickness="0.2" data-bgcolor="#e0e0e0" data-fgcolor="#67b173" readOnly />
                                </div>
                                <h3 className="mb-0 mt-3 font600"><span className="counter">1,24,301</span> <span className="text-green font-15">+3.7%</span></h3>
                                <small>Lorem Ipsum is simply dummy text <br /> <a href="#">Read more</a> </small>
                                <div className="mt-4">
                                    <span className="theme1-chart_3">4,5,8,4,6,9,4,5,6,3</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                        <div className="card performance-overview">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Performance</h3>
                                <div className="card-options">
                                    <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fa-solid fa-maximize"></i></a>
                                    <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                </div>
                            </div>
                            <div className="card-body">
                                <span>Measure How Fast You re Growing Monthly Recurring Revenue. <a href="#">Learn More</a></span>
                                <ul className="list-group mt-3 mb-0">
                                    <li className="list-group-item">
                                        <div className="clearfix mb-1">
                                            <div className="float-left font700">87%</div>
                                            <div className="float-right"><small className="text-muted">Design Team</small></div>
                                        </div>
                                        <div className="progress" style={{ height: "5px" }}>
                                            <div className="progress-bar bg-azure" role="progressbar" aria-valuenow={87} aria-valuemin={0} aria-valuemax={100} style={{ width: "87%" }} ></div>
                                        </div>
                                    </li>
                                    <li className="list-group-item">
                                        <div className="clearfix mb-1">
                                            <div className="float-left font700">76%</div>
                                            <div className="float-right"><small className="text-muted">Developer Team</small></div>
                                        </div>
                                        <div className="progress" style={{ height: "5px" }}>
                                            <div className="progress-bar bg-green" role="progressbar" aria-valuenow={76} aria-valuemin={0} aria-valuemax={100} style={{ width: "76%" }} ></div>
                                        </div>
                                    </li>
                                    <li className="list-group-item">
                                        <div className="clearfix mb-1">
                                            <div className="float-left font700">36%</div>
                                            <div className="float-right"><small className="text-muted">Marketing</small></div>
                                        </div>
                                        <div className="progress" style={{ height: "5px" }}>
                                            <div className="progress-bar bg-orange" role="progressbar" aria-valuenow={36} aria-valuemin={0} aria-valuemax={100} style={{ width: "36%" }} ></div>
                                        </div>
                                    </li>
                                    <li className="list-group-item">
                                        <div className="clearfix mb-1">
                                            <div className="float-left font700">81%</div>
                                            <div className="float-right"><small className="text-muted">Management</small></div>
                                        </div>
                                        <div className="progress" style={{ height: "5px" }}>
                                            <div className="progress-bar bg-indigo" role="progressbar" aria-valuenow={81} aria-valuemin={0} aria-valuemax={100} style={{ width: "81%" }} ></div>
                                        </div>
                                    </li>
                                    <li className="list-group-item">
                                        <div className="clearfix mb-1">
                                            <div className="float-left font700">45%</div>
                                            <div className="float-right"><small className="text-muted">Other</small></div>
                                        </div>
                                        <div className="progress" style={{ height: "5px" }}>
                                            <div className="progress-bar bg-pink" role="progressbar" aria-valuenow={45} aria-valuemin={0} aria-valuemax={100} style={{ width: "45%" }} ></div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-sm-6">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Growth</h3>
                                <div className="card-options">
                                    <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fa-solid fa-maximize"></i></a>
                                    <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                </div>
                            </div>
                            <div className="card-body text-center">
                                <div id="GROWTH" style={{ height: "240px" }}></div>
                            </div>
                            <div className="card-footer text-center">
                                <div className="row clearfix">
                                    <div className="col-6">
                                        <h5 className="pt-1 mb-0 font600">$3,095</h5>
                                        <small className="text-muted">Last Year</small>
                                    </div>
                                    <div className="col-6">
                                        <h5 className="pt-1 mb-0 font600">$2,763</h5>
                                        <small className="text-muted">This Year</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6 col-12">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Employee Structure</h3>
                                <div className="card-options">
                                    <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fa-solid fa-maximize"></i></a>
                                    <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                </div>
                            </div>
                            <div className="card-body text-center">
                                <div id="chart-bar-stacked" style={{ height: "290px" }}></div>
                                <div className="row clearfix pt-1">
                                    <div className="col-6">
                                        <h5 className="pt-1 mb-0 font600">50</h5>
                                        <small className="text-muted">Male</small>
                                    </div>
                                    <div className="col-6">
                                        <h5 className="pt-1 mb-0 font600">17</h5>
                                        <small className="text-muted">Female</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-12">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Project Summary</h3>
                                <div className="card-options">
                                    <a href="#" className="card-options-collapse" data-toggle="card-collapse"><i className="fa-solid fa-chevron-up"></i></a>
                                    <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fa-solid fa-maximize"></i></a>
                                    <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                    <div className="item-action dropdown ml-2">
                                        <a href="javascript:void(0)" data-toggle="dropdown"><i className="fa-solid fa-ellipsis-vertical"></i></a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-eye"></i> View Details </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-share-alt"></i> Share </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-cloud-download"></i> Download</a>
                                            <div className="dropdown-divider"></div>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-copy"></i> Copy to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-folder"></i> Move to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-edit"></i> Rename</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa-solid fa-trash"></i> Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped text-nowrap table-vcenter mb-0">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Client Name</th>
                                                <th>Team</th>
                                                <th>Project</th>
                                                <th>Project Cost</th>
                                                <th>Payment</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>#AD1245</td>
                                                <td>Sean Black</td>
                                                <td>
                                                    <ul className="list-unstyled team-info sm margin-0 w150">
                                                        <li><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar3.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar4.jpg" alt="Avatar" /></li>
                                                        <li className="ml-2"><span>2+</span></li>
                                                    </ul>
                                                </td>
                                                <td>Angular Admin</td>
                                                <td>$14,500</td>
                                                <td>Done</td>
                                                <td><span className="tag tag-success">Delivered</span></td>
                                            </tr>
                                            <tr>
                                                <td>#DF1937</td>
                                                <td>Sean Black</td>
                                                <td>
                                                    <ul className="list-unstyled team-info sm margin-0 w150">
                                                        <li><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar3.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar4.jpg" alt="Avatar" /></li>
                                                        <li className="ml-2"><span>2+</span></li>
                                                    </ul>
                                                </td>
                                                <td>Angular Admin</td>
                                                <td>$14,500</td>
                                                <td>Pending</td>
                                                <td><span className="tag tag-success">Delivered</span></td>
                                            </tr>
                                            <tr>
                                                <td>#YU8585</td>
                                                <td>Merri Diamond</td>
                                                <td>
                                                    <ul className="list-unstyled team-info sm margin-0 w150">
                                                        <li><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" /></li>
                                                    </ul>
                                                </td>
                                                <td>One page html Admin</td>
                                                <td>$500</td>
                                                <td>Done</td>
                                                <td><span className="tag tag-orange">Submit</span></td>
                                            </tr>
                                            <tr>
                                                <td>#AD1245</td>
                                                <td>Sean Black</td>
                                                <td>
                                                    <ul className="list-unstyled team-info sm margin-0 w150">
                                                        <li><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar3.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar4.jpg" alt="Avatar" /></li>
                                                    </ul>
                                                </td>
                                                <td>Wordpress One page</td>
                                                <td>$1,500</td>
                                                <td>Done</td>
                                                <td><span className="tag tag-success">Delivered</span></td>
                                            </tr>
                                            <tr>
                                                <td>#GH8596</td>
                                                <td>Allen Collins</td>
                                                <td>
                                                    <ul className="list-unstyled team-info sm margin-0 w150">
                                                        <li><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar3.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar4.jpg" alt="Avatar" /></li>
                                                        <li className="ml-2"><span>2+</span></li>
                                                    </ul>
                                                </td>
                                                <td>VueJs Application</td>
                                                <td>$9,500</td>
                                                <td>Done</td>
                                                <td><span className="tag tag-success">Delivered</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}